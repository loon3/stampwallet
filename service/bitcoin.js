import Mnemonic from 'bitcore-mnemonic'
import * as ecc from 'tiny-secp256k1'
import ECPairFactory, { ECPairInterface } from 'ecpair'
import { memoize } from 'decko'
import { KEY_RING_TYPE, DEFAULT_HD_PATH } from '@/constant'
import { sha512 } from 'js-sha512'
import { sendTransaction, getTransaction } from '../query/bitcoin'
import { sum } from 'lodash'
import crypto from 'crypto'
import { encrypt, decrypt } from '@/utils/aes'
import bitcore from 'bitcore-lib'

import * as bitcoin from 'bitcoinjs-lib'

bitcoin.initEccLib(ecc)

//TODO: fix this
const getOutputVbytes = (vout) => {
  return 31
}

//TODO: fix this
const getInputVbytes = (utxo) => {
  return 68
}

const selectUtxos = (utxos, vouts, feeRate) => {
  const sortedUtxos = utxos.sort((a, b) => b.value - a.value)
  const outValueSum = sum(vouts.map((e) => e.value))

  let vbTotal = 0
  const vbOverHead = 10.5

  vbTotal += vbOverHead

  for (let vout of vouts) {
    vbTotal += getOutputVbytes(vout)
  }
  vbTotal += getOutputVbytes({ address: 'change address', value: 'change value' })

  let utxoValueSum = 0
  let inputs = []

  for (let i in sortedUtxos) {
    const utxo = sortedUtxos[i]
    const vbUtxo = getInputVbytes(utxo)

    inputs.push(utxo)
    vbTotal += vbUtxo
    utxoValueSum += utxo.value
    const feeSum = feeRate * vbTotal

    if (utxoValueSum >= outValueSum + feeSum) {
      return {
        fee: feeSum,
        inputs: inputs,
        change: parseInt(utxoValueSum - (outValueSum + feeSum)),
      }
    }
  }
  return { fee: feeRate * vbTotal }
}

export const prepareSendBitcoin = async ({
  ecPair,
  network,
  utxos,
  changeAddress,
  toAddress,
  value,
  feeRate,
}) => {
  console.log(ecPair, network, utxos, changeAddress, toAddress, value, feeRate)
  const psbtNetwork = network === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin
  const psbt = new bitcoin.Psbt({ network: psbtNetwork })

  const vouts = [{ address: toAddress, value }]
  const { inputs, fee, change } = selectUtxos(utxos, vouts, feeRate)

  if (!inputs) {
    throw new Error(`Not enough balance: ${fee} `)
  }

  for (let input of inputs) {
    const txDetails = await getTransaction(network, input.txid)
    const inputDetails = txDetails.vout[input.vout]
    const isWitnessUtxo = inputDetails.scriptPubKey.type.startsWith('witness')

    let psbtInput = {
      hash: input.txid,
      index: input.vout,
      //   sequence: 0xffffffff,
    }
    if (isWitnessUtxo) {
      psbtInput.witnessUtxo = {
        script: Buffer.from(inputDetails.scriptPubKey.hex, 'hex'),
        value: input.value,
      }
    } else {
      psbtInput.nonWitnessUtxo = Buffer.from(txDetails.hex, 'hex')
    }
    psbt.addInput(psbtInput)
  }

  for (let vout of vouts) {
    psbt.addOutput(vout)
  }

  psbt.addOutput({
    address: changeAddress,
    value: change,
  })

  psbt.signAllInputs(ecPair)

  const validator = (pubkey, msghash, signature) =>
    ECPairFactory(ecc).fromPublicKey(pubkey).verify(msghash, signature)
  psbt.validateSignaturesOfInput(0, validator)
  psbt.finalizeAllInputs()

  const txHex = psbt.extractTransaction().toHex()
  return { txHex, fee }
}

export const sendBitcoin = async ({ network, txHex }) => {
  const txHexBack = await sendTransaction(network, txHex)
  return txHexBack
}

function address_from_pubkeyhash(pubkeyhash) {
  var publicKey = new bitcore.PublicKey(pubkeyhash)
  var address = bitcore.Address.fromPublicKey(publicKey)

  return address.toString()
}

const selectSrc20Utxos = (utxos, vouts, feeRate) => {
  const sortedUtxos = utxos.sort((a, b) => b.value - a.value)
  const outValueSum = sum(vouts.map((e) => e.value))

  let vbTotal = 0
  const vbOverHead = 10.5

  vbTotal += vbOverHead

  vbTotal += 31 * 2
  vbTotal += (vouts.length - 1) * 120

  let utxoValueSum = 0
  let inputs = []

  for (let i in sortedUtxos) {
    const utxo = sortedUtxos[i]
    const vbUtxo = getInputVbytes(utxo)

    inputs.push(utxo)
    vbTotal += vbUtxo
    utxoValueSum += utxo.value
    const feeSum = feeRate * vbTotal

    if (utxoValueSum >= outValueSum + feeSum) {
      return {
        fee: feeSum,
        inputs: inputs,
        change: parseInt(utxoValueSum - (outValueSum + feeSum)),
      }
    }
  }
  return { fee: feeRate * vbTotal }
}

function scramble(key, str) {
  var s = [],
    j = 0,
    x,
    res = ''
  for (var i = 0; i < 256; i++) {
    s[i] = i
  }
  for (i = 0; i < 256; i++) {
    j = (j + s[i] + key.charCodeAt(i % key.length)) % 256
    x = s[i]
    s[i] = s[j]
    s[j] = x
  }
  i = 0
  j = 0
  for (var y = 0; y < str.length; y++) {
    i = (i + 1) % 256
    j = (j + s[i]) % 256
    x = s[i]
    s[i] = s[j]
    s[j] = x
    res += String.fromCharCode(str.charCodeAt(y) ^ s[(s[i] + s[j]) % 256])
  }
  return res
}

function hex2bin(hex) {
  var bytes = []
  var str

  for (var i = 0; i < hex.length - 1; i += 2) {
    var ch = parseInt(hex.substr(i, 2), 16)
    bytes.push(ch)
  }

  str = String.fromCharCode.apply(String, bytes)
  return str
}

function bin2hex(s) {
  var i,
    l,
    o = '',
    n

  s += ''

  for (i = 0, l = s.length; i < l; i++) {
    n = s.charCodeAt(i).toString(16)
    o += n.length < 2 ? '0' + n : n
  }

  return o
}

export const prepareSendSrc20 = async ({
  ecPair,
  network,
  utxos,
  changeAddress,
  toAddress,
  token,
  amount,
  feeRate,
}) => {
  const psbtNetwork = network === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin
  const psbt = new bitcoin.Psbt({ network: psbtNetwork })
  const sortedUtxos = utxos.sort((a, b) => b.value - a.value)
  const vouts = [{ address: toAddress, value: 555 }]
  const transferString = `stamp:{"p":"src-20","op":"transfer","tick":"${token}","amt":"${amount}"}`
  let transferHex = Buffer.from(transferString, 'utf-8').toString('hex')
  let count = (transferHex.length / 2).toString(16)
  let padding = ''
  for (let i = count.length; i < 4; i++) {
    padding += '0'
  }
  transferHex = padding + count + transferHex

  let remaining = transferHex.length % (62 * 2)
  if (remaining > 0) {
    for (let i = 0; i < 62 * 2 - remaining; i++) {
      transferHex += '0'
    }
  }
  const encryption = bin2hex(scramble(hex2bin(sortedUtxos[0].txid), hex2bin(transferHex)))
  let chunks = []
  for (let i = 0; i < encryption.length; i = i + 62 * 2) {
    chunks.push(encryption.substring(i, i + 62 * 2))
  }
  chunks = chunks.map((datachunk) => {
    var pubkey_seg1 = datachunk.substring(0, 62)
    var pubkey_seg2 = datachunk.substring(62, 124)
    var second_byte
    var pubkeyhash
    var address1 = ''
    var address2 = ''

    while (address1.length == 0) {
      var first_byte = Math.random() > 0.5 ? '02' : '03'
      second_byte = crypto.randomBytes(1).toString('hex')
      pubkeyhash = first_byte + pubkey_seg1 + second_byte

      if (bitcore.PublicKey.isValid(pubkeyhash)) {
        var hash1 = pubkeyhash
        var address1 = address_from_pubkeyhash(pubkeyhash)
      }
    }

    while (address2.length == 0) {
      var first_byte = Math.random() > 0.5 ? '02' : '03'
      second_byte = crypto.randomBytes(1).toString('hex')
      pubkeyhash = first_byte + pubkey_seg2 + second_byte

      if (bitcore.PublicKey.isValid(pubkeyhash)) {
        var hash2 = pubkeyhash
        var address2 = address_from_pubkeyhash(pubkeyhash)
      }
    }
    var data_hashes = [hash1, hash2]
    return data_hashes
  })

  const cpScripts = chunks.map((each) => {
    return `5121${each[0]}21${each[1]}2102020202020202020202020202020202020202020202020202020202020202020253ae`
  })
  for (let cpScriptHex of cpScripts) {
    vouts.push({
      script: Buffer.from(cpScriptHex, 'hex'),
      value: 888,
    })
  }
  const { inputs, fee, change } = selectSrc20Utxos(sortedUtxos, vouts, feeRate)
  if (!inputs) {
    throw new Error(`Not enough balance: ${fee} `)
  }
  for (let input of inputs) {
    const txDetails = await getTransaction(network, input.txid)
    const inputDetails = txDetails.vout[input.vout]
    const isWitnessUtxo = inputDetails.scriptPubKey.type.startsWith('witness')
    let psbtInput = {
      hash: input.txid,
      index: input.vout,
    }
    if (isWitnessUtxo) {
      psbtInput.witnessUtxo = {
        script: Buffer.from(inputDetails.scriptPubKey.hex, 'hex'),
        value: input.value,
      }
    } else {
      psbtInput.nonWitnessUtxo = Buffer.from(txDetails.hex, 'hex')
    }
    psbt.addInput(psbtInput)
  }
  for (let vout of vouts) {
    psbt.addOutput(vout)
  }
  psbt.addOutput({
    address: changeAddress,
    value: change,
  })
  psbt.signAllInputs(ecPair)
  const validator = (pubkey, msghash, signature) =>
    ECPairFactory(ecc).fromPublicKey(pubkey).verify(msghash, signature)
  psbt.validateSignaturesOfInput(0, validator)
  psbt.finalizeAllInputs()
  const txHex = psbt.extractTransaction().toHex()
  return { txHex, fee }
}
