import { Box, Text, Center, VStack, Spacer, Button, Icon } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import wallet from '@/service/wallet'
import BackIcon from '@/component/BackIcon'
import QRCode from 'qrcode.react'
import { addressSummary } from '@/utils/common'
import { notify, notifyWarn, getExplorerLink } from '@/utils/common'
import { FiCopy } from 'react-icons/fi'
import { RiAccountCircleLine } from 'react-icons/ri'

const Receive = () => {
  const router = useRouter()
  const account = wallet.getCurrentAccount()
  let accountAddress = account?.address || ''
  let accountName = account?.name.slice(0, 20)

  return (
    <Box>
      <BackIcon />

      <Center mb="50px">
        <Text fontSize={'15px'}>Receive Bitcoin</Text>
      </Center>

      <Center>
        <Box p="10px" bg="#ffffff" width="200px" borderRadius="8px">
          <QRCode value={accountAddress} renderAs="svg" size={'180px'}></QRCode>
        </Box>
      </Center>

      <Center mt="20px">
        <Icon mr="10px" as={RiAccountCircleLine} boxSize="18px" />
        <Text fontSize={'14px'}>{accountName}</Text>
      </Center>
      <Center
        mt="20px"
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
        <Text fontSize={'13px'}>{`${addressSummary(accountAddress, 8)}`}</Text>
        <Icon ml="10px" as={FiCopy} boxSize="10px" />
      </Center>
    </Box>
  )
}

export default Receive
