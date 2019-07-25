// @flow
import React, { useState } from 'react'
import { Keyboard, TouchableWithoutFeedback, View } from 'react-native'
import { isMobile } from 'mobile-device-detect'
import InputGoodDollar from '../form/InputGoodDollar'
import { withStyles } from '../../../lib/styles'
import Text from '../view/Text'
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
          />
        </TouchableWithoutFeedback>
        <Text style={[styles.errorText, { opacity: error ? 1 : 0 }]}>{error || 'I'}</Text>
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
    errorText: {
      color: theme.colors.error,
      marginTop: theme.sizes.default,
    },
    errorInput: {
      color: theme.colors.error,
      borderBottomColor: theme.colors.error,
    },
  }
}

export default withStyles(mapPropsToStyles)(AmountInput)
