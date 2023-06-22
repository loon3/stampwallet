import {
  Box,
  Text,
  Center,
  VStack,
  Spacer,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  Link,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { notifyWarn } from '@/utils/common'
import PasswordInput from '@/component/PasswordInput'
import wallet from '@/service/wallet'

const Unlock = () => {
  const router = useRouter()
  const [password, setPassword] = useState('')

  return (
    <Box>
      <Center mt="200px" fontSize="xl">
        Welcome!
      </Center>
      <Spacer mt="50px" />
      <PasswordInput password={password} setPassword={setPassword} />
      <Spacer mt="20px" />
      <Center>
        <Button
          w="100%"
          onClick={async () => {
            try {
              await wallet.unlock(password)
              router.push('/')
            } catch (e) {
              if (e.message === 'Incorrect password') {
                notifyWarn({ title: 'Password is incorrect' })
              } else {
                notifyWarn({ title: e.message })
              }
            }
          }}
        >
          Unlock wallet
        </Button>
      </Center>

      <Center mt="20px">
        <Link
          fontSize="13px"
          onClick={() => {
            router.push('/welcome')
          }}
        >
          Forget your password?
        </Link>
      </Center>
    </Box>
  )
}

export default Unlock
