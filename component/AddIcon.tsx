import { Box, Text, Center, VStack, Spacer, Button } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { PhoneIcon, AddIcon as AddIcon_, WarningIcon, ArrowBackIcon } from '@chakra-ui/icons'

export const AddIcon = ({ onClick }) => {
  const router = useRouter()

  return <AddIcon_ w={'20px'} h={'20px'} onClick={onClick} cursor={'pointer'} />
}
