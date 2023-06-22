import { Box, Text, Center, VStack, Spacer, Flex, Button } from '@chakra-ui/react'
import BackIcon from '@/component/BackIcon'

export const SettingLayout = (props) => {
  return (
    <Box>
      <Flex>
        <BackIcon />
        <Spacer />
        {props.center}
        <Spacer />
        {props.right}
      </Flex>

      <Spacer mt="30px" />
      {props.children}
    </Box>
  )
}
