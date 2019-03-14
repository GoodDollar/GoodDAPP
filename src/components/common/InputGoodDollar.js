// @flow

import React from 'react'
import { TextInput } from 'react-native-paper'
import { weiToMask, maskToWei } from '../../lib/wallet/utils'

type Props = {
  onChangeWei: number => void,
  wei: number
}

const InputGoodDollar = (props: Props) => {
  return (
    <TextInput
      {...props}
      value={weiToMask(props.wei)}
      onChangeText={text => {
        props.onChangeWei(maskToWei(text))
      }}
    />
  )
}

export default InputGoodDollar
