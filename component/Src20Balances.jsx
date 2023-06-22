import { Box, Text, Center, VStack, Spacer, Button, Flex, Spinner } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { PhoneIcon, AddIcon, WarningIcon, ArrowBackIcon } from '@chakra-ui/icons'
import { useQuery } from '@tanstack/react-query'
import { querySrc20ByAddress } from '../query/src20.js'
import numeral from 'numeral'
import { prettyFloat } from '@/utils/common'

export default function Home({ summary, isLoading }) {
  if (isLoading) {
    return (
      <Center mt="100px">
        <Spinner />
      </Center>
    )
  }

  return (
    <Box>
      {summary.map((item, index) => {
        return (
          <Box key={index} my="10px">
            <Flex>
              <Text fontSize={'lg'}>{item.tick.toUpperCase()}</Text>
              <Spacer />
              <Text fontSize={'lg'}>{prettyFloat(item.total_amt, 6, true)}</Text>
            </Flex>
          </Box>
        )
      })}
    </Box>
  )
}
