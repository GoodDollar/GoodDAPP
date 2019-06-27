// @flow
import React, { useState } from 'react'
import { TextInput } from 'react-native'
import { moneyRegexp, numberWithCommas } from '../../lib/wallet/utils'

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

const getUpdatedPosition = (text, inputType, selection) => {
  let updatedSelection = selection
  const [integerText] = text.split('.')
  if (inputType === 'deleteContentBackward') {
    if (integerText.replace(/,/g, '').length % 3 === 0 && integerText.length > 1) {
      updatedSelection = {
        start: selection.start - 1,
        end: selection.end - 1
      }
    }
  } else if (inputType) {
    if (integerText.replace(/,/g, '').length % 3 === 1 && integerText.length > 1) {
      updatedSelection = {
        start: selection.start + 1,
        end: selection.end + 1
      }
    }
  }

  return updatedSelection
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
    if (text === '') {
      onChangeAmount(text)
    }
    if (moneyRegexp.test(text)) {
      const isDecimal = text.indexOf('.') > -1
      if (isDecimal) {
        const [intValue, decimalVal] = text.split('.')
        onChangeAmount(`${numberWithCommas(intValue)}.${decimalVal}`)
      } else {
        onChangeAmount(numberWithCommas(text))
      }
    }
  }

  const handleSelectionChange = ({ nativeEvent: { text, inputType, selection } }: SelectionEvent) => {
    const updatedSelection = getUpdatedPosition(text, inputType, selection)
    setSelection(updatedSelection)
    onSelectionChange(updatedSelection)
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
