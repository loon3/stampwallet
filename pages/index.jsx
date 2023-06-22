import {
  Box,
  Text,
  Center,
  VStack,
  Spacer,
  Button,
  Flex,
  Icon,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import wallet from '@/service/wallet'
import { useQuery } from '@tanstack/react-query'
import { queryUtxos, sendTransaction } from '../query/bitcoin'
import { useState, useEffect } from 'react'
import Jazzicon from 'react-jazzicon'
import { BsThreeDots } from 'react-icons/bs'
import { FiCopy } from 'react-icons/fi'
import { AiOutlineArrowUp, AiOutlineQrcode } from 'react-icons/ai'
import { SlRefresh } from 'react-icons/sl'
import { BiTransferAlt } from 'react-icons/bi'
import { notify, notifyWarn, getExplorerLink } from '@/utils/common'
import { addressSummary } from '@/utils/common'
import Src20Balances from '@/component/Src20Balances'
import AccountActivity from '@/component/AccountActivity'
import { querySrc20ByAddress } from '../query/src20.js'
import { getBtcBalanceFromUtxos } from '@/utils/common'

const Home = () => {
  const router = useRouter()
  let account = wallet.getCurrentAccount()

  const network = wallet.getNetwork()
  let accountAddress = account?.address || 'fakeaddress'

  const {
    data,
    isLoading,
    isFetching: isFetchingSrc20,
    refetch: refetchSrc20,
  } = useQuery(['querySrc20ByAddress', { address: accountAddress }], querySrc20ByAddress, {
    refetchInterval: 180 * 1000,
  })

  const {
    data: utxosData,
    isLoading: isLoadingUtxo,
    isFetching: isFetchingUtxo,
    refetch: refetchUtxo,
  } = useQuery({
    queryKey: ['utxos', { network, address: account?.address, confirmed: true }],
    queryFn: queryUtxos,
    refetchInterval: 180 * 1000,
  })

  const utxos = utxosData || []
  const btcBalance = getBtcBalanceFromUtxos(utxos)

  const { latest, summary } = data?.data || {
    summary: [],
    latest: [],
  }

  return (
    <Box>
      <Flex>
        <Box
          cursor={'pointer'}
          onClick={() => {
            router.push('/setting/accounts')
          }}
          pt="6px"
        >
          <Jazzicon diameter={50} seed={parseInt(accountAddress.slice(2, 10), 36)} />
        </Box>
        <Center ml="20px">
          <Box>
            <Text fontSize={'lg'}> {account?.name.slice(0, 20)} </Text>
            <Center
              cursor="pointer"
              onClick={() => {
                navigator.clipboard.writeText(accountAddress)
                notify({
                  title: `Address Copied: ${accountAddress.slice(0, 5)}...${accountAddress.slice(
                    account.address.length - 5,
                    account.address.length
                  )}`,
                })
              }}
            >
              <Text fontSize={'13px'}>{`${addressSummary(accountAddress, 5)}`}</Text>
              <Icon ml="10px" as={FiCopy} boxSize="10px" />
            </Center>
          </Box>
        </Center>
        <Spacer />
        <Center>
          <Icon
            onClick={() => {
              router.push('/setting')
            }}
            boxSize={'20px'}
            as={BsThreeDots}
            cursor="pointer"
          />
        </Center>
      </Flex>

      <Center mt="10px">
        <Text fontSize="25px">{`${btcBalance} BTC`}</Text>
        {isFetchingSrc20 || isFetchingUtxo ? (
          <Spinner ml="15px" size="sm" />
        ) : (
          <Icon
            ml="15px"
            as={SlRefresh}
            boxSize="18px"
            cursor={'pointer'}
            onClick={() => {
              refetchSrc20()
              refetchUtxo()
            }}
          />
        )}
      </Center>

      <HStack mt="20px">
        <Button
          w="100%"
          leftIcon={<BiTransferAlt />}
          onClick={() => {
            router.push('/account/sendSrc20')
          }}
        >
          SRC20
        </Button>
        <Button
          w="100%"
          leftIcon={<AiOutlineArrowUp />}
          onClick={() => {
            router.push('/account/send')
          }}
        >
          Send
        </Button>
        <Button
          w="100%"
          leftIcon={<AiOutlineQrcode />}
          onClick={() => {
            router.push('/account/receive')
          }}
        >
          Receive
        </Button>
      </HStack>

      <Box mt="20px">
        <Tabs isFitted variant="soft-rounded">
          <TabList p="5px">
            <Tab>Balances</Tab>
            <Tab>Activity</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Src20Balances summary={summary} isLoading={isLoading} />
            </TabPanel>
            <TabPanel>
              <AccountActivity address={accountAddress} network={network} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  )
}

export default Home
