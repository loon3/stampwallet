import {
  Box,
  Text,
  Center,
  VStack,
  Spacer,
  Button,
  Icon,
  Input,
  Link,
  useDisclosure,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import wallet from '@/service/wallet'
import BackIcon from '@/component/BackIcon'
import { addressSummary, BITCOIN_TO_SATOSHI } from '@/utils/common'
import { notify, notifyWarn, getExplorerLink } from '@/utils/common'
import { FiCopy } from 'react-icons/fi'
import { RiAccountCircleLine } from 'react-icons/ri'
import { useQuery } from '@tanstack/react-query'
import { queryUtxos, sendTransaction, queryMempoolFee } from '@/query/bitcoin'
import { prepareSendSrc20 } from '@/service/bitcoin'
import { SendingSrc20Confirm } from '@/component/SendingSrc20Confirm'
import {
  setLocalItem,
  getLocalItem,
  setSessionItem,
  getSessionItem,
  removeSessionItem,
} from '@/service/storage'
import { LOCAL_STORAGE } from '@/constant'

const Send = () => {
  const MIN_FEE_RATE = 36
  const router = useRouter()
  const [recipient, setRecipient] = useState('')
  const [token, setToken] = useState('')
  const [amount, setAmount] = useState('')
  const [feeRate, setFeeRate] = useState('')
  const [feeSum, setFeeSum] = useState('')
  const [pendingTxHex, setPendingTxHex] = useState()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isSending, setIsSending] = useState()

  const account = wallet.getCurrentAccount()
  const network = wallet.getNetwork()

  const isNonSegwitAddress = account?.address.substring(0, 1) !== 'b'

  const { data: memPoolFeeRecommended, isLoading: isLoadingMemPoolFee } = useQuery(
    ['queryMempoolFee', {}],
    queryMempoolFee,
    {
      refetchInterval: 120 * 1000,
    }
  )
  const recommendedFeePerVb = memPoolFeeRecommended
    ? Math.max(
        MIN_FEE_RATE,
        parseInt(memPoolFeeRecommended * 2.3 * (isNonSegwitAddress ? 1.2 : 1.0))
      )
    : undefined

  useEffect(() => {
    if (recommendedFeePerVb) {
      if (feeRate === '') {
        setFeeRate(recommendedFeePerVb)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommendedFeePerVb])

  const {
    data: utxosData,
    isLoading: isLoadingUtxo,
    isFetching: isFetchingUtxo,
    refetch: refetchUtxos,
  } = useQuery({
    queryKey: ['utxos', { network, address: account?.address, confirmed: true }],
    queryFn: queryUtxos,
  })

  const handleClickSend = async () => {
    if (recipient.length < 10) {
      notifyWarn({ title: `Invalid recipient address` })
      return
    }

    if (token.length === 0 || token.length > 5) {
      notifyWarn({ title: `Invalid token` })
      return
    }

    if (parseFloat(feeRate || '0') < MIN_FEE_RATE) {
      notifyWarn({ title: `Fee cannot be lower than ${MIN_FEE_RATE} sat/vB` })
      return
    }

    setIsSending(true)
    const ecPair = account?.ecpair
    try {
      const { txHex, fee } = await prepareSendSrc20({
        ecPair,
        network,
        utxos,
        toAddress: recipient,
        changeAddress: account.address,
        token: token,
        amount: parseFloat(amount),
        feeRate: feeRate,
      })
      setPendingTxHex(txHex)
      setFeeSum(fee)
      onOpen()
    } catch (e) {
      setIsSending(false)
      notifyWarn({ title: e.message })
    }
  }

  const utxos = utxosData || []

  const onCloseConfirm = () => {
    onClose()
    setIsSending(false)
  }

  const onConfirm = async () => {
    try {
      const txId = await sendTransaction(network, pendingTxHex)
      setPendingTxHex(null)
      const curActivities = JSON.parse((await getLocalItem(LOCAL_STORAGE.ACCOUNT_ACTIVITY)) || '[]')
      curActivities.push({ network, address: account.address, txId: txId, date: new Date() })
      await setLocalItem(LOCAL_STORAGE.ACCOUNT_ACTIVITY, JSON.stringify(curActivities))
      onCloseConfirm()
      router.push('/')
    } catch (e) {
      notifyWarn({ title: e.message })
      if (e.message.includes('conflict')) {
        console.log('mempool conflict')

        // in case of conflict, fetch utxo and resend
        await refetchUtxos()
        handleClickSend()
      }
    }
  }

  return (
    <Box>
      <BackIcon />

      <Center mb="50px">
        <Text fontSize={'15px'}>Send SRC20</Text>
      </Center>

      <SendingSrc20Confirm
        isOpen={isOpen}
        onClose={onCloseConfirm}
        onConfirm={onConfirm}
        info={{ network, recipient, token, amount, feeRate, feeInBtc: feeSum / BITCOIN_TO_SATOSHI }}
      />

      <Box>Recipient</Box>

      <Input
        pr="4.5rem"
        mt="5px"
        variant="filled"
        size="md"
        fontSize="16px"
        placeholder="The recipient address"
        value={recipient}
        onChange={(e) => {
          setRecipient(e.target.value.replace(/\s\s+/g, ''))
        }}
      />

      <Box mt="10px">Token</Box>

      <Input
        pr="4.5rem"
        mt="5px"
        variant="filled"
        size="md"
        fontSize="16px"
        placeholder="Token to send"
        value={token}
        onChange={(e) => {
          setToken(e.target.value.replace(/\s\s+/g, ''))
        }}
      />

      <Box mt="10px">Amount</Box>

      <Input
        pr="4.5rem"
        mt="5px"
        variant="filled"
        size="md"
        placeholder="Token Amount"
        fontSize="16px"
        value={amount}
        onChange={(e) => {
          setAmount(e.target.value.replace(/[^0-9.]/g, ''))
        }}
      />

      <Box mt="10px">Fee rate (sat/vB)</Box>

      <Input
        pr="4.5rem"
        mt="5px"
        variant="filled"
        size="md"
        placeholder="Fee rate (satoshi per vbyte)"
        fontSize="16px"
        value={feeRate}
        onChange={(e) => {
          setFeeRate(e.target.value.replace(/[^0-9.]/g, ''))
        }}
      />
      <Link
        fontSize="14px"
        color="gray.400"
        onClick={() => {
          window.open('https://mempool.space/')
        }}
      >
        {memPoolFeeRecommended
          ? `Current: ${memPoolFeeRecommended} sat/vB. Recommend: ${recommendedFeePerVb} sat/vB`
          : `Loading fee...`}
      </Link>

      <Center mt="30px">
        <Button
          w="100%"
          isLoading={isLoadingUtxo || isSending}
          onClick={() => {
            handleClickSend()
          }}
        >
          Send
        </Button>
      </Center>
    </Box>
  )
}

export default Send
