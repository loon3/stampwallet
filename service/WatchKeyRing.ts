import * as ecc from 'tiny-secp256k1'
import ECPairFactory, { ECPairInterface } from 'ecpair'
import { KEY_RING_TYPE } from '@/constant'
import { sha512 } from 'js-sha512'

import * as bitcoin from 'bitcoinjs-lib'

bitcoin.initEccLib(ecc)
const ECPair = ECPairFactory(ecc)

export default class WatchKeyRing {
  type = KEY_RING_TYPE.WATCH
  address

  constructor(address) {
    this.address = address
  }

  getId() {
    return sha512(`${this.type} - ${this.address}`)
  }

  getAccount(network) {
    return { address: this.address }
  }
}
