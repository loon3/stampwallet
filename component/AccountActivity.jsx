import { Box, Text, Link, Center, VStack, Spacer, Button, Flex, Spinner } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { PhoneIcon, AddIcon, WarningIcon, ArrowBackIcon } from '@chakra-ui/icons'
import { useQuery } from '@tanstack/react-query'
import { querySrc20ByAddress } from '../query/src20.js'
import { useState, useEffect } from 'react'
import numeral from 'numeral'
import moment from 'moment'
import {
  setLocalItem,
  getLocalItem,
  setSessionItem,
  getSessionItem,
  removeSessionItem,
} from '@/service/storage'
import { LOCAL_STORAGE } from '@/constant'

const getExplorerUrl = (network, txId) => {
  const urlBase =
    network === 'livenet' ? 'https://mempool.space/tx' : 'https://mempool.space/testnet/tx'
  return `${urlBase}/${txId}`
}

export default function Home({ address, network }) {
  const [activities, setActivities] = useState([])

  useEffect(() => {
    const getItem = async () => {
      const items = (await getLocalItem(LOCAL_STORAGE.ACCOUNT_ACTIVITY)) || '[]'
      const itemsParsed = JSON.parse(items)
      let filterd = itemsParsed.filter((e) => e.address === address && e.network === network)
      filterd.sort((a, b) => new Date(b.date) - new Date(a.date))
      setActivities(filterd)
    }
    getItem()
  }, [address, network])

  return (
    <Box maxHeight={'300px'} overflowY={'scroll'} pr="16px">
      {activities.map((item, index) => {
        return (
          <Box key={index} my="10px">
            <Flex>
              <Link
                fontSize="13px"
                onClick={() => {
                  window.open(getExplorerUrl(network, item.txId))
                }}
              >
                {item.txId.substring(0, 10)}
              </Link>

              <Spacer />
              <Text fontSize={'13px'}>{moment(item.date).format('YYYY-MM-DD HH:mm')}</Text>
            </Flex>
          </Box>
        )
      })}
    </Box>
  )
}
