import React from 'react'
import { TextInput } from 'react-native-paper'
import { weiToMask, maskToWei } from '../../lib/wallet/utils'

const InputGoodDollar = props => {
  return (
    <TextInput
      {...props}
      step="0.01"
      placeholder="0"
      value={weiToMask(props.wei)}
      onChangeText={text => {
        props.onChangeWei(maskToWei(text))
      }}
    />
  )
}

export default InputGoodDollar
