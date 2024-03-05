// @flow
import React from 'react'
import Text from './Text'

type AddressProps = {
  value: string,
}

const Address = React.memo(({ value }: AddressProps) => (
  <Text>{value && `${value.slice(0, 6)}...${value.slice(value.length - 4)}`}</Text>
))

export default Address
