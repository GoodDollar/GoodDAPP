// @flow
import React, { useState } from 'react'
import normalize from '../../../lib/utils/normalizeText'

import { moneyRegexp } from '../../../lib/wallet/utils'
import { withStyles } from '../../../lib/styles'
import InputText from './InputText'

type SelectionProp = {
  start: number,
  end: number,
}

type Props = {
  onChangeAmount: string => void,
  amount: number,
  onSelectionChange: SelectionProp => void,
  style?: any,
  styles?: any,
}

type SelectionEvent = {
  nativeEvent: {
    selection: SelectionProp,
    text: string,
    inputType: string,
  },
}

/**
 * Receives amount and shows as G$ using `TextInput` component (react-native-paper).
 * @param {Props} props
 * @param {number => void} props.onChangeAmount send input value as amount to convert to wei out of this component
 * @param {number} props.amount to be shown as G$
 * @returns {React.Node}
 */
const InputGoodDollar = (props: Props) => {
  const { onChangeAmount, amount, onSelectionChange, style, styles, ...rest } = props
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
    <InputText
      {...rest}
      style={[style, styles ? styles.input : {}]}
      selection={selection}
      onSelectionChange={handleSelectionChange}
      value={amount}
      onChangeText={handleValueChange}
      placeholder="0 G$"
    />
  )
}

InputGoodDollar.defaultProps = {
  onSelectionChange: () => {},
}

const getStylesFromProps = () => ({
  input: {
    fontSize: normalize(32),
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
})

export default withStyles(getStylesFromProps)(InputGoodDollar)
