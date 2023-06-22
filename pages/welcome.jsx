import { Box, Text, Center, VStack, Spacer, Button } from '@chakra-ui/react'
import { useRouter } from 'next/router'

const Home = () => {
  const router = useRouter()

  return (
    <Box>
      <Center mt="200px" fontSize="xl">
        Wallet for Bitcoin Stamp
      </Center>
      <Spacer mt="50px" />
      <Center>
        <Button
          w="100%"
          onClick={() => {
            router.push(
              {
                pathname: '/wallet',
                query: { step: 'mnemonic_generate' },
              },
              '/wallet'
            )
          }}
        >
          Create a wallet
        </Button>
      </Center>
      <Spacer mt="20px" />
      <Center>
        <Button
          w="100%"
          onClick={() => {
            router.push(
              {
                pathname: '/wallet',
                query: { step: 'mnemonic_import' },
              },
              '/wallet'
            )
          }}
        >
          Import a wallet
        </Button>
      </Center>
    </Box>
  )
}

export default Home
