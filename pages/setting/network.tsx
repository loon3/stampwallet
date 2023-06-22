import { Box, Text, Center, VStack, Spacer, Button } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import wallet from '@/service/wallet'
import { SettingLayout } from '@/component/SettingLayout'
import { Select } from '@/component/Select'
import { useEffect, useState, useReducer } from 'react'

enum NETWORK_OPTIONS {
  LIVENET = 'livenet',
  TESTNET = 'testnet',
}

const networkOptions = [
  { value: NETWORK_OPTIONS.LIVENET, label: 'Livenet' },
  { value: NETWORK_OPTIONS.TESTNET, label: 'Testnet' },
]

const Home = () => {
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0)
  const network = wallet.getNetwork()
  const networkSelect = {
    value: network,
    label: network === NETWORK_OPTIONS.LIVENET ? 'Livenet' : 'Testnet',
  }

  const router = useRouter()

  return (
    <SettingLayout>
      <Text mt="20px">Network:</Text>
      <Select
        options={networkOptions}
        value={networkSelect}
        onChange={(data) => {
          wallet.setNetwork(data.value)
          forceUpdate()
        }}
      />
    </SettingLayout>
  )
}

export default Home
