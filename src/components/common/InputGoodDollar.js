// @flow
import React, { useState } from 'react'
import { TextInput } from 'react-native'
import { gdToWei, moneyRegexp, weiToGd } from '../../lib/wallet/utils'

type SelectionProp = {
  start: number,
  end: number
}

type Props = {
  onChangeWei: number => void,
  wei: number,
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
  const integerText = text.split('.')[0]
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
 * Receives wei and shows as G$ using `TextInput` component (react-native-paper).
 * @param {Props} props
 * @param {number => void} props.onChangeWei send input value as wei
 * @param {number} props.wei to be shown as G$
 * @returns {React.Node}
 */
const InputGoodDollar = (props: Props) => {
  const { onChangeWei, wei, onSelectionChange, ...rest } = props
  const [selection, setSelection] = useState({ start: 0, end: 0 })

  const handleValueChange = (text: string) => {
    let amount = text.replace(/,/g, '')
    if (amount.split('.')[1] && amount.split('.')[1].length > 2) {
      amount = (amount / Math.pow(10, -1)).toFixed(2)
    }
    const pass = amount.match(moneyRegexp) !== null || amount === ''
    if (pass || amount === '.00') {
      const wei = gdToWei(amount)
      onChangeWei(wei)
    }
  }

  const handleSelectionChange = ({ nativeEvent: { text, inputType, selection } }: SelectionEvent) => {
    const updatedSelection = getUpdatedPosition(text, inputType, selection)
    setSelection(updatedSelection)
    onSelectionChange(updatedSelection)
  }

  const getValue = () => {
    const gd = weiToGd(wei)
    return gd.length && gd.indexOf('.') < 0 ? `${gd}.00` : gd
  }

  return (
    <TextInput
      {...rest}
      selection={selection}
      onSelectionChange={handleSelectionChange}
      value={getValue()}
      onChangeText={handleValueChange}
      placeholder="0 G$"
    />
  )
}

InputGoodDollar.defaultProps = {
  onSelectionChange: () => {}
}

export default InputGoodDollar
