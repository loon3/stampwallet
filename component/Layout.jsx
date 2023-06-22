import { Box, useColorMode, Center, Spinner } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { StoreProvider } from '@/context/store'
import { useRouter } from 'next/router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import wallet from '@/service/wallet'

const queryClient = new QueryClient()

export default function Layout({ children }) {
  const { colorMode, toggleColorMode } = useColorMode()

  const router = useRouter()
  const [account, setAccount] = useState(null)

  const isUnlockPage = router.route === '/unlock'
  const isWelcomePage = router.route === '/welcome' || router.route === '/wallet'

  useEffect(() => {
    const tryLoadWallet = async () => {
      console.log('Try load wallet')
      const walletHasData = await wallet.localStorageHasData()

      if (walletHasData) {
        try {
          await wallet.load()
          console.log(router.route)
          if (!isUnlockPage && !isWelcomePage) router.push(router.route)
          console.log('wallet loaded')
        } catch (e) {
          console.log(e)
          console.log('Auto unlock fail. Redirect to manual unlock')
          if (!isUnlockPage) router.push('/unlock')
        }
      } else {
        if (!isWelcomePage) router.push('/welcome')
      }
    }

    try {
      if (!isWelcomePage) setAccount(wallet.getCurrentAccount())
    } catch (e) {
      tryLoadWallet()
    }
  }, [setAccount, router, isUnlockPage, isWelcomePage])

  const marginTop = window.innerHeight > 600 ? '100px' : '0px'

  useEffect(() => {
    if (colorMode === 'light') {
      toggleColorMode()
    }
  })

  const waitForWallet = !isUnlockPage && !isWelcomePage && account === null

  const waitForWalletContent = (
    <Center mt="300px">
      <Spinner />
    </Center>
  )

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <Box
          mt={marginTop}
          maxW="360px"
          maxH="600px"
          bgColor={'gray.700'}
          width="100vw"
          height="100vh"
          p="20px"
        >
          <div>{waitForWallet ? waitForWalletContent : children}</div>
        </Box>
      </StoreProvider>
    </QueryClientProvider>
  )
}
