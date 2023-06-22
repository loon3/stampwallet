import { Box, Text, Center, VStack, Spacer, Button, Icon, Divider } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import wallet from '@/service/wallet'
import { useEffect, useState, useReducer } from 'react'
import { SettingLayout } from '@/component/SettingLayout'
import { AccountCard } from '@/component/AccountCard'
import { AddIcon } from '@/component/AddIcon'

export default function Accounts() {
  const router = useRouter()
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0)

  const accounts = wallet.getAccounts()
  const network = wallet.getNetwork()

  return (
    <SettingLayout center="Accounts" right={null}>
      <Box
        maxHeight={'500px'}
        overflowY={'scroll'}
        sx={{
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          '::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      >
        {accounts.map((account, index) => {
          return (
            <AccountCard
              key={index}
              index={index}
              account={account}
              network={network}
              onClick={() => {
                wallet.setCurrentAccountIndex(index)
                router.push('/')
              }}
              onDelete={() => {
                const deleted = wallet.deleteAccount(index)
                forceUpdate()
                return deleted
              }}
            />
          )
        })}

        <Divider my="20px" />
        <Center
          mt="10px"
          onClick={() => {
            router.push('/setting/addAccount')
          }}
          cursor={'pointer'}
        >
          <Center bgColor={'gray.500'} w="50px" h="50px" borderRadius={'25px'}>
            <Icon boxSize={'50px'} as={AddIcon}></Icon>
          </Center>
          <Text ml="10px">Add a new account</Text>
        </Center>
      </Box>
    </SettingLayout>
  )
}
