import { Box } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import wallet from '@/service/wallet'

const Lock = () => {
  const router = useRouter()

  useEffect(() => {
    const func = async () => {
      await wallet.lock()
      router.push('/unlock')
    }
    func()
  }, [router])

  return <Box></Box>
}

export default Lock
