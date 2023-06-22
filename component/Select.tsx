import { Select as Select_ } from 'chakra-react-select'
import { Box, Flex, Center } from '@chakra-ui/react'

export const Select = (props) => {
  return <Select_ useBasicStyles selectedOptionStyle="color" {...props} />
}
