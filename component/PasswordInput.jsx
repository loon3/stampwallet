import {
  Box,
  Text,
  Center,
  VStack,
  Spacer,
  Button,
  Input,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react'
import { useState } from 'react'

export default function PasswordInput({ password, setPassword }) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <InputGroup size="md" my="10px">
      <Input
        pr="4.5rem"
        type={showPassword ? 'text' : 'password'}
        placeholder="Enter password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value)
        }}
      />
      <InputRightElement width="4.5rem">
        <Button h="1.75rem" size="sm" onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? 'Hide' : 'Show'}
        </Button>
      </InputRightElement>
    </InputGroup>
  )
}
