import Mnemonic from 'bitcore-mnemonic'
import * as ecc from 'tiny-secp256k1'
import ECPairFactory, { ECPairInterface } from 'ecpair'
import { memoize } from 'decko'
import { KEY_RING_TYPE, DEFAULT_HD_PATH } from '@/constant'
import { sha512 } from 'js-sha512'

import * as bitcoin from 'bitcoinjs-lib'

bitcoin.initEccLib(ecc)
const ECPair = ECPairFactory(ecc)

export default class HdKeyRing {
  type = KEY_RING_TYPE.HD
  mnemonic = ''
  passphrase = ''
  hdWallet

  constructor(mnemonic, passphrase = '') {
    this.mnemonic = mnemonic
    this.passphrase = passphrase

    this.hdWallet = new Mnemonic(this.mnemonic)
  }

  getId() {
    return sha512(`${this.type} - ${this.mnemonic} - ${this.passphrase}`)
  }

  getAccount(index, network, hdPath = DEFAULT_HD_PATH) {
    const root = this.hdWallet.toHDPrivateKey(this.passphrase, network)
    const hdRoot = root.deriveChild(hdPath)
    const child = hdRoot.deriveChild(index)
    const ecpair = ECPair.fromPrivateKey(child.privateKey.toBuffer())
    const publickey = ecpair.publicKey.toString('hex')
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: ecpair.publicKey,
      network: network === 'livenet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet,
    })
    return { address, ecpair }
  }
}
