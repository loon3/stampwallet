import Mnemonic from 'bitcore-mnemonic'
import encryptor from 'browser-passworder'
import {
  setLocalItem,
  getLocalItem,
  setSessionItem,
  getSessionItem,
  removeSessionItem,
} from '@/service/storage'
import * as bitcoin from 'bitcoinjs-lib'
import HdKeyRing from '@/service/HdKeyRing'
import { DEFAULT_HD_PATH, KEY_RING_TYPE } from '@/constant'

import { LOCAL_STORAGE, SESSION_STORAGE } from '@/constant'
import { sha512 } from 'js-sha512'

class Wallet {
  keyRings: any[] = []
  keyRingMapping: { [key: string]: any } = {}
  displayConfig: any[] = []
  network: string = 'livenet'

  generateMnemonic() {
    return new Mnemonic().toString()
  }

  getAccount(accountIndex: number) {
    const config = this.displayConfig[accountIndex]
    const keyRing = this.keyRingMapping[config.keyRingId]
    let res = {}
    if (keyRing) {
      const account = keyRing.getAccount(config.index, this.network, config.hdPath)
      res = {
        ecpair: account.ecpair,
        address: account.address,
        hdPath: config.hdPath,
        index: config.index,
        name: config.name,
        isCurrent: config.isCurrent,
      }
    }
    return res
  }

  //TODO: cache this in a smart way
  getAccounts() {
    const accounts: any[] = []
    this.displayConfig.forEach((each, index) => {
      accounts.push(this.getAccount(index))
    })
    return accounts
  }

  getHdKeyRings() {
    return this.keyRings.filter((e) => e.type === KEY_RING_TYPE.HD)
  }

  getHdKeyRing(index: number) {
    return this.getHdKeyRings()[index]
  }

  getHdKeyRingCount() {
    return this.getHdKeyRings().length
  }

  checkHdKeyRingAccountExist(hdKeyRingIndex: number, index: number, hdPath = DEFAULT_HD_PATH) {
    // if account already exist, no need to insert
    let exist = false
    let keyRingId = this.getHdKeyRing(hdKeyRingIndex).getId()
    this.displayConfig.forEach((e) => {
      if (e.keyRingId === keyRingId && e.index === index && e.hdPath === hdPath) exist = true
    })
    return exist
  }

  addHdKeyRingAccount(
    hdKeyRingIndex: number,
    index: number,
    name: string,
    hdPath = DEFAULT_HD_PATH
  ) {
    // if account already exist, no need to insert
    if (this.checkHdKeyRingAccountExist(hdKeyRingIndex, index, hdPath)) return false

    this.displayConfig.push({
      keyRingId: this.getHdKeyRing(hdKeyRingIndex).getId(),
      hdPath,
      index,
      name: name || `Account ${index}`,
    })
    // don't need to await
    this.persist()
    return true
  }

  setNetwork(network: string) {
    this.network = network
    this.persist()
  }

  getNetwork() {
    return this.network
  }

  deleteAccount(index: number) {
    // cannot delete if there is only one account
    if (this.displayConfig.length <= 1) return false

    const deleteCurrent = this.displayConfig[index].isCurrent
    this.displayConfig.splice(index, 1)
    if (deleteCurrent) this.displayConfig[0].isCurrent = true
    this.persist()
    return true
  }

  updateAccountName(index: number, name: string) {
    this.displayConfig[index].name = name
    this.persist()
  }

  setCurrentAccountIndex(accountIndex: number) {
    if (this.displayConfig.length === 0 || this.displayConfig.length <= accountIndex) return

    for (let i = 0; i < this.displayConfig.length; i++) {
      this.displayConfig[i].isCurrent = accountIndex === i
    }
    if (this.displayConfig.length > 0) {
      this.persist()
    }
  }

  getCurrentAccountIndex() {
    for (let i = 0; i < this.displayConfig.length; i++) {
      if (this.displayConfig[i].isCurrent) return i
    }

    // if we cannot find anything; reset currentAccountIndex to 0
    this.setCurrentAccountIndex(0)
    return 0
  }

  getCurrentAccount() {
    return this.getAccount(this.getCurrentAccountIndex())
  }

  // call this whenever keyRing is updated
  updateKeyRingMapping() {
    const map = {}
    this.keyRings.forEach((keyRing) => {
      map[keyRing.getId()] = keyRing
    })
    this.keyRingMapping = map
  }

  addMnemonic(mnemonic, passphrase = '') {
    // supprot one for now
    this.clearMemmory()

    // check exist
    let exist = false
    this.keyRings.forEach((keyRing) => {
      if (keyRing.mnemonic === mnemonic && keyRing.passphrase === passphrase) {
        exist = true
      }
    })

    if (exist) return

    const hdKeyRing = new HdKeyRing(mnemonic, passphrase)
    this.keyRings.push(hdKeyRing)
    this.updateKeyRingMapping()

    // always add first account whenever we add a new mnemonic
    this.displayConfig.push({
      keyRingId: hdKeyRing.getId(),
      hdPath: DEFAULT_HD_PATH,
      index: 0,
      name: 'Account 0',
    })
  }

  updatePasswordHash = async (password) => {
    const passwordHash = sha512(password)
    await setSessionItem(SESSION_STORAGE.PASSWORD_HASH, passwordHash)
  }

  getPasswordHash = async () => {
    const passwordHash = await getSessionItem(SESSION_STORAGE.PASSWORD_HASH)
    return passwordHash
  }

  localStorageHasData = async () => {
    const cipher = await getLocalItem(LOCAL_STORAGE.WALLET_ENCRYPT)
    return cipher
  }

  persist = async () => {
    const passwordHash = await this.getPasswordHash()

    const keyRingData = this.keyRings.map((keyRing) => {
      return {
        type: keyRing.type,
        mnemonic: keyRing.mnemonic,
        passphrase: keyRing.passphrase,
      }
    })

    const dataToPersist = {
      keyRingData,
      displayConfig: this.displayConfig,
      network: this.network,
    }

    console.log('persist', this.displayConfig)
    const cipher = await encryptor.encrypt(passwordHash, dataToPersist)
    await setLocalItem(LOCAL_STORAGE.WALLET_ENCRYPT, cipher)
  }

  load = async () => {
    const passwordHash = await this.getPasswordHash()
    const cipher = await getLocalItem(LOCAL_STORAGE.WALLET_ENCRYPT)
    const { keyRingData, displayConfig, network } = await encryptor.decrypt(passwordHash, cipher)

    // update keyRings
    const keyRings: any = []
    keyRingData.forEach((each) => {
      if (each.type === KEY_RING_TYPE.HD) {
        const keyRing = new HdKeyRing(each.mnemonic, each.passphrase)
        keyRings.push(keyRing)
      }
    })
    this.keyRings = keyRings
    this.updateKeyRingMapping()

    // update display config
    this.displayConfig = displayConfig || []
    this.network = network || 'livenet'
  }

  unlock = async (password) => {
    await this.updatePasswordHash(password)
    await this.load()
  }

  lock = async () => {
    await removeSessionItem(SESSION_STORAGE.PASSWORD_HASH)
    this.clearMemmory()
  }

  clearMemmory = async () => {
    this.keyRings = []
    this.keyRingMapping = {}
    this.displayConfig = []
  }

  // verify when in unlock state
  verifyPassword = async (password) => {
    const passwordHash = await this.getPasswordHash()
    return passwordHash && sha512(password) === passwordHash
  }
}

const wallet = new Wallet()
export default wallet
