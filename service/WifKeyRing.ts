import * as ecc from 'tiny-secp256k1'
import ECPairFactory, { ECPairInterface } from 'ecpair'
import { KEY_RING_TYPE } from '@/constant'
import { sha512 } from 'js-sha512'

import * as bitcoin from 'bitcoinjs-lib'

bitcoin.initEccLib(ecc)
const ECPair = ECPairFactory(ecc)

export default class WifKeyRing {
  type = KEY_RING_TYPE.WIF
  addressType
  wif
  account

  constructor(wif, addressType) {
    this.wif = wif
    this.addressType = addressType
  }

  getId() {
    return sha512(`${this.type} - ${this.wif} - ${this.addressType}`)
  }

  getAccount(network) {
    try {
      const ecpair = ECPair.fromWIF(this.wif)
      if (this.addressType === 'legacy') {
        const { address } = bitcoin.payments.p2pkh({
          pubkey: ecpair.publicKey,
          network: network === 'livenet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet,
        })
        return { address, ecpair }
      }

      if (this.addressType === 'segwit') {
        const { address } = bitcoin.payments.p2wpkh({
          pubkey: ecpair.publicKey,
          network: network === 'livenet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet,
        })
        return { address, ecpair }
      }
    } catch (e) {
      console.log(e)
    }
    return {}
  }
}
