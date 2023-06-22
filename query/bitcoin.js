import { axios } from '../utils/axios.js'

export const queryBase = async ({ network, method, params }) => {
  const url =
    network === 'livenet'
      ? process.env.NEXT_PUBLIC_BITCOIN_MAIN_API
      : process.env.NEXT_PUBLIC_BITCOIN_TEST_API

  const payload = { method, params }
  let res = {}
  try {
    res = await axios.post(url, payload)
  } catch (e) {
    res = e.response
  }
  const { result, error } = res.data || { error: 'Empty data' }
  if (error) {
    throw new Error(`Query faled: ${method}. Message: ${error.message}`)
  }
  return result
}

// export const queryUtxos = async ({ queryKey }) => {
//   const [_key, { network, address, confirmed }] = queryKey
//   const method = 'bb_getutxos'
//   const params = [address, { confirmed }]
//   return await queryBase({ network, method, params })
// }

export const queryUtxos = async ({ queryKey }) => {
  const [_key, { network, address, confirmed }] = queryKey
  if (!address) return {}

  const baseUrl =
    network === 'testnet'
      ? process.env.NEXT_PUBLIC_BITCOIN_BLOCKSTREAM_TEST_API
      : process.env.NEXT_PUBLIC_BITCOIN_BLOCKSTREAM_MAIN_API

  const res = await axios.get(`${baseUrl}/address/${address}/utxo`)
  return res.data
}

export const sendTransaction = async (network, txHex) => {
  const res = await queryBase({ network, params: [txHex], method: 'sendrawtransaction' })
  return res
}

export const getTransaction = async (network, txId) => {
  const res = await queryBase({ network, params: [txId, 1], method: 'getrawtransaction' })
  return res
}

export const queryMempoolFee = async ({ queryKey }) => {
  const url = 'https://mempool.space/api/v1/fees/recommended'
  try {
    const res = await axios.get(url)
    if (res.status === 200) {
      return res.data.fastestFee
    }
  } catch (e) {
    logger.error(e)
  }
  return null
}
