import '@/styles/globals.css'
import Layout from '@/component/Layout'
import NoSSRWrapper from '@/component/no-ssr-wrapper'

import { ChakraProvider } from '@chakra-ui/react'

export default function App({ Component, pageProps }) {
  return (
    <NoSSRWrapper>
      <ChakraProvider toastOptions={{ defaultOptions: { position: 'top' } }}>
        <Layout>
          <Component {...pageProps} />{' '}
        </Layout>
      </ChakraProvider>
    </NoSSRWrapper>
  )
}
