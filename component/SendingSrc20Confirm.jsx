import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
  Button,
  Text,
  useDisclosure,
  Box,
} from '@chakra-ui/react'
import { useRef, useEffect } from 'react'

export function SendingSrc20Confirm(props) {
  const { isOpen, onClose, onConfirm, info } = props
  const { network, recipient, feeRate, feeInBtc, token, amount } = info
  const cancelRef = useRef()

  return (
    <>
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} p="50px">
        <AlertDialogOverlay p="50px">
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Send Bitcoin
            </AlertDialogHeader>

            <AlertDialogBody>
              <Text>Confirm the transaction information:</Text>
              <Box fontSize="13px" mt="10px" color="gray.300">
                <Text>Network: {network}</Text>
                <Text>Recipient: {recipient}</Text>
                <Text>
                  Sending: {amount} {token}
                </Text>
                <Text>Fee Rate: {feeRate}</Text>
                <Text>Transaction Fee: {feeInBtc} BTC</Text>
              </Box>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={onConfirm} ml={3}>
                Send
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}
