// @flow
import React, { useState } from 'react'
import { TextInput } from 'react-native'
import { moneyRegexp } from '../../../lib/wallet/utils'

type SelectionProp = {
  start: number,
  end: number
}

type Props = {
  onChangeAmount: number => void,
  amount: number,
  onSelectionChange?: SelectionProp => void
}

type SelectionEvent = {
  nativeEvent: {
    selection: SelectionProp,
    text: string,
    inputType: string
  }
}

/**
 * Receives amount and shows as G$ using `TextInput` component (react-native-paper).
 * @param {Props} props
 * @param {number => void} props.onChangeAmount send input value as amount to convert to wei out of this component
 * @param {number} props.amount to be shown as G$
 * @returns {React.Node}
 */
const InputGoodDollar = (props: Props) => {
  const { onChangeAmount, amount, onSelectionChange, ...rest } = props
  const [selection, setSelection] = useState({ start: 0, end: 0 })

  const handleValueChange = (text: string) => {
    if (text === '' || moneyRegexp.test(text)) {
      onChangeAmount(text.replace(',', '.'))
    }
  }

  const handleSelectionChange = ({ nativeEvent: { selection } }: SelectionEvent) => {
    setSelection(selection)
    onSelectionChange(selection)
  }

  return (
    <TextInput
      {...rest}
      selection={selection}
      onSelectionChange={handleSelectionChange}
      value={amount}
      onChangeText={handleValueChange}
      placeholder="0 G$"
    />
  )
}

InputGoodDollar.defaultProps = {
  onSelectionChange: () => {}
}

export default InputGoodDollar
