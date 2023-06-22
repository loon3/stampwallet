import { Box, Text, Button, Input } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import wallet from '@/service/wallet'
import { useState } from 'react'
import { SettingLayout } from '@/component/SettingLayout'

const Home = () => {
  const router = useRouter()
  const [accountName, setAccountName] = useState(router.query.accountName)

  return (
    <SettingLayout>
      <Box>
        <Text mt="20px">Name: (optional)</Text>
        <Input onChange={(e) => setAccountName(e.target.value)} value={accountName}></Input>
      </Box>

      <Box>
        <Button
          mt="20px"
          w="100%"
          onClick={() => {
            wallet.updateAccountName(parseInt(router.query.index as string), accountName as string)
            router.back()
          }}
        >
          Save
        </Button>
      </Box>
    </SettingLayout>
  )
}

export default Home
