import { axios } from '../utils/axios.js'

const srcBaseUrl = process.env.NEXT_PUBLIC_STAMP_INDEXER_URL
export const querySrc20ByAddress = async ({ queryKey }) => {
  const [_key, { address }] = queryKey

  if (address?.length < 10) return []

  const res = await axios.get(`${srcBaseUrl}/src20/mintByAddressV1?address=${address}`)
  return res
}
