import { createStandaloneToast } from '@chakra-ui/toast'
import { Box, Center } from '@chakra-ui/react'
import { sum, isEmpty } from 'lodash'

export const BITCOIN_TO_SATOSHI = 100000000

const { toast } = createStandaloneToast()

export const notify = ({
  title,
  status = 'info',
  duration = 1000,
  bgColor = 'rgba(118,177,232, 0.8)',
}) => {
  toast({
    title: title,
    status: status,
    duration: duration,
    isClosable: true,
    position: 'top',
    render: (props) => {
      return (
        <Center px="10px">
          <Box color="white" p={3} bg={bgColor} borderRadius="5px" w="250px">
            <Center fontSize={'13px'}>{title}</Center>
          </Box>
        </Center>
      )
    },
  })
}

export const notifyWarn = ({
  title,
  status = 'warning',
  duration = 1000,
  bgColor = 'orange.400',
}) => {
  notify({ title, status, duration, bgColor })
}

export const addressSummary = (address, cut = 5) => {
  if (!address) return ''
  return `${address.slice(0, cut)}...${address.slice(address.length - cut, address.length)}`
}

export const getExplorerLink = (address, network) => {
  if (network === 'testnet') return `https://live.blockcypher.com/btc-testnet/address/${address}/`
  return `https://www.blockchain.com/explorer/addresses/btc/${address}`
}

export const getBtcBalanceFromUtxos = (utxos) => {
  if (isEmpty(utxos)) {
    return 0
  }

  const satBalance = sum(utxos.map((e) => e.value))
  return satBalance / BITCOIN_TO_SATOSHI
}

export const prettyFloat = (value, precision, localize) => {
  value = value || ''
  precision = precision || 0
  localize = localize || false

  var rounded, trimmed

  rounded =
    !isNaN(precision) && parseInt(precision, 10) > 0
      ? parseFloat(value).toFixed(parseInt(precision, 10))
      : value

  trimmed = parseFloat(rounded).toString()

  if (localize && !isNaN(trimmed)) {
    return parseFloat(trimmed).toLocaleString()
  }

  return trimmed
}
