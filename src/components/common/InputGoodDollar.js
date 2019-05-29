// @flow
import React from 'react'
import { TextInput } from 'react-native-paper'
import { maskToWei, weiToMask } from '../../lib/wallet/utils'

type Props = {
  onChangeWei: number => void,
  wei: number
}

/**
 * Receives wei and shows as G$ using `TextInput` component (react-native-paper).
 * @param {Props} props
 * @param {number => void} props.onChangeWei send input value as wei
 * @param {number} props.wei to be shown as G$
 * @returns {React.Node}
 */
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
