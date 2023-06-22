import { Box, Text, Center, VStack, Spacer, Button } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { PhoneIcon, AddIcon, WarningIcon, ArrowBackIcon } from '@chakra-ui/icons'

export default function Home() {
  const router = useRouter()

  return (
    <ArrowBackIcon
      w={'25px'}
      h={'25px'}
      onClick={() => {
        router.back()
      }}
      cursor={'pointer'}
    />
  )
}
