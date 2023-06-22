import {
  Box,
  Container,
  Stack,
  Center,
  StackDivider,
  Switch,
  Text,
  Divider,
  Button,
  Flex,
  Spacer,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  PopoverAnchor,
  VStack,
} from '@chakra-ui/react'
import { addressSummary } from '@/utils/common'
import { CheckIcon, AddIcon, WarningIcon, ArrowBackIcon } from '@chakra-ui/icons'
import { BsThreeDots } from 'react-icons/bs'
import { FiCopy, FiEdit2 } from 'react-icons/fi'
import { RiDeleteBin6Line } from 'react-icons/ri'
import { BiLinkExternal } from 'react-icons/bi'
import Jazzicon from 'react-jazzicon'
import { notify, notifyWarn, getExplorerLink } from '@/utils/common'
import { useRouter } from 'next/router'

export const AccountCard = ({ index, account, network, onClick, onDelete }) => {
  const router = useRouter()

  return (
    <Box borderRadius={'8px'} bgColor="gray.600" my="8px">
      <Box cursor={'pointer'} h="66px" py="10px" px="10px">
        <Flex>
          <Center mx="6px" onClick={onClick}>
            <Jazzicon diameter={40} seed={parseInt(account.address.slice(2, 10), 36)} />
          </Center>
          <Box onClick={onClick}>
            <Text color="muted">{account.name || 'Unnamed'}</Text>
            <Text fontSize={'13px'}>{`${addressSummary(account.address)} (${account.index})`}</Text>
          </Box>
          <Spacer onClick={onClick} />
          <Center mx="8px">{account.isCurrent && <CheckIcon />}</Center>
          <Center px="8px">
            <Popover placement="left">
              <PopoverTrigger>
                <Box>
                  <BsThreeDots />
                </Box>
              </PopoverTrigger>
              <PopoverContent width="100px">
                <PopoverArrow />
                <PopoverBody>
                  <VStack spacing={'10px'}>
                    <Center
                      onClick={() => {
                        window.open(getExplorerLink(account.address, network))
                      }}
                    >
                      <BiLinkExternal /> <Text mx="10px">Explorer</Text>
                    </Center>
                    <Center
                      onClick={() => {
                        router.push({
                          pathname: '/setting/editAccount',
                          query: { index, accountName: account.name },
                        })
                      }}
                    >
                      <FiEdit2 /> <Text mx="10px">Edit</Text>
                    </Center>
                    <Center
                      onClick={() => {
                        navigator.clipboard.writeText(account.address)
                        notify({
                          title: `Address Copied: ${account.address.slice(
                            0,
                            5
                          )}...${account.address.slice(
                            account.address.length - 5,
                            account.address.length
                          )}`,
                        })
                      }}
                    >
                      <FiCopy></FiCopy> <Text mx="10px">Copy</Text>
                    </Center>
                    <Center
                      onClick={() => {
                        if (onDelete()) {
                          notify({ title: 'Account deleted' })
                        } else {
                          notifyWarn({ title: 'Not able to delete the only one account' })
                        }
                      }}
                    >
                      <RiDeleteBin6Line /> <Text mx="10px">Delete</Text>
                    </Center>
                  </VStack>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </Center>
        </Flex>
      </Box>
      {/* <Switch defaultChecked={account.isActive} /> */}
    </Box>
  )
}
