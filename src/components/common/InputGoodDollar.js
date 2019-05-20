// @flow

import React from 'react'
import { TextInput } from 'react-native-paper'
import { weiToMask, maskToWei } from '../../lib/wallet/utils'

type Props = {
  onChangeWei: number => void,
  wei: number
}

const InputGoodDollar = (props: Props) => {
  const { onChangeWei, ...rest } = props
  return (
    <TextInput
      {...rest}
      value={weiToMask(props.wei)}
      onChangeText={text => {
        onChangeWei(maskToWei(text))
      }}
      placeholder="0 G$"
    />
  )
}

export default InputGoodDollar
