import {
  Box,
  Text,
  Center,
  VStack,
  Spacer,
  Button,
  Input,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import wallet from '@/service/wallet'
import { useEffect, useState } from 'react'
import { Select } from '@/component/Select'
import { notify, notifyWarn } from '@/utils/common'
import { SettingLayout } from '@/component/SettingLayout'

enum TYPE_OPTIONS {
  HD_WALLET = 'hd_wallet',
  PRIVATE_KEY = 'private_key',
  WATCH = 'watch',
}

const typeOptions = [
  { value: TYPE_OPTIONS.HD_WALLET, label: 'HD Wallet' },
  { value: TYPE_OPTIONS.PRIVATE_KEY, label: 'Private Key' },
  { value: TYPE_OPTIONS.WATCH, label: 'Watch' },
]

const generateNumOptions = (number) => {
  let options: any = []
  for (let i = 0; i < number; i++) {
    options.push({ value: i, label: `HD Wallet #${i}` })
  }
  return options
}

const maxHdPathIndex = 1000000

const Home = () => {
  const [type, setType] = useState(typeOptions[0])
  const [hdKeyRingIndex, setHdKeyRingIndex] = useState({ value: 0, label: `HD Wallet #0` })
  const [hdPathIndex, setHdPathIndex] = useState(0)
  const [accountName, setAccountName] = useState('')
  const router = useRouter()

  return (
    <SettingLayout>
      <Text mt="20px">Type:</Text>

      <Select options={typeOptions} value={type} onChange={setType} />
      {type.value === TYPE_OPTIONS.HD_WALLET && (
        <Box>
          <Text mt="20px">HD Wallet:</Text>
          <Select
            options={generateNumOptions(wallet.getHdKeyRingCount())}
            value={hdKeyRingIndex}
            onChange={setHdKeyRingIndex}
          />
          <Text mt="20px">HD Path Index:</Text>
          <NumberInput
            onChange={(valueAsString, valueAsNum) =>
              setHdPathIndex(Math.min(2100000, valueAsNum) || 0)
            }
            keepWithinRange
            defaultValue={0}
            min={0}
            max={maxHdPathIndex}
          >
            <NumberInputField />
          </NumberInput>
          <Text mt="20px">Address:</Text>
          <Text fontSize={'13px'}>
            {
              wallet
                .getHdKeyRing(hdKeyRingIndex.value)
                ?.getAccount(Math.min(maxHdPathIndex, hdPathIndex), wallet.getNetwork())?.address
            }
          </Text>

          <Text mt="20px">Name: (optional)</Text>
          <Input onChange={(e) => setAccountName(e.target.value)} value={accountName}></Input>
        </Box>
      )}
      {type.value !== TYPE_OPTIONS.HD_WALLET && (
        <Box>
          <Text my="20px">Coming soon...</Text>
        </Box>
      )}

      {type.value === TYPE_OPTIONS.HD_WALLET && (
        <Box>
          <Button
            mt="20px"
            w="100%"
            onClick={() => {
              const res = wallet.addHdKeyRingAccount(hdKeyRingIndex.value, hdPathIndex, accountName)
              if (res) {
                notify({ title: 'Account added' })
                router.back()
              } else {
                notifyWarn({ title: 'Account already exists' })
              }
            }}
          >
            Add
          </Button>
        </Box>
      )}
    </SettingLayout>
  )
}

export default Home
