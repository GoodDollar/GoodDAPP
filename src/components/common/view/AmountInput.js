// @flow
import React, { useState } from 'react'
import { Keyboard, TouchableWithoutFeedback, View } from 'react-native'
import { isMobile } from 'mobile-device-detect'
import InputGoodDollar from '../form/InputGoodDollar'
import { withStyles } from '../../../lib/styles'
import NumPadKeyboard from './NumPadKeyboard'

type AmountInputProps = {
  amount: string,
  handleAmountChange: Function,
  styles: any,
}

const AmountInput = ({ amount, handleAmountChange, styles, error }: AmountInputProps) => {
  const [caretPosition, setCaretPosition] = useState({ start: 0, end: 0 })

  return (
    <View style={styles.wrapper}>
      <View>
        <TouchableWithoutFeedback
          onPress={() => (isMobile ? Keyboard.dismiss() : null)}
          accessible={false}
          style={styles.section}
        >
          <InputGoodDollar
            style={error ? styles.errorInput : {}}
            disabled={isMobile}
            autoFocus
            amount={amount}
            onChangeAmount={handleAmountChange}
            onSelectionChange={setCaretPosition}
            error={error}
          />
        </TouchableWithoutFeedback>
      </View>
      <NumPadKeyboard
        amount={amount}
        onPress={handleAmountChange}
        caretPosition={caretPosition}
        updateCaretPosition={setCaretPosition}
      />
    </View>
  )
}

const mapPropsToStyles = ({ theme }) => {
  return {
    wrapper: {
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      flex: 1,
    },
    errorInput: {
      color: theme.colors.error,
      borderBottomColor: theme.colors.error,
    },
  }
}

export default withStyles(mapPropsToStyles)(AmountInput)
