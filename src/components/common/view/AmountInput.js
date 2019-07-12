// @flow
import React, { useState } from 'react'
import { Keyboard, StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import { isMobile } from 'mobile-device-detect'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import InputGoodDollar from '../form/InputGoodDollar'
import { withStyles } from '../../../lib/styles'
import NumPadKeyboard from './NumPadKeyboard'

type AmountInputProps = {
  amount: string,
  handleAmountChange: Function,
  styles: any
}

const AmountInput = ({ amount, handleAmountChange, styles }: AmountInputProps) => {
  const [caretPosition, setCaretPosition] = useState({ start: 0, end: 0 })

  return (
    <View style={styles.inputField}>
      <View style={styles.amountWrapper}>
        <TouchableWithoutFeedback
          onPress={() => (isMobile ? Keyboard.dismiss() : null)}
          accessible={false}
          style={styles.section}
        >
          <View style={styles.section}>
            <InputGoodDollar
              disabled={isMobile}
              autoFocus
              style={styles.amountInput}
              amount={amount}
              onChangeAmount={handleAmountChange}
              onSelectionChange={setCaretPosition}
            />
          </View>
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
    inputField: {
      width: '100%',
      flexDirection: 'column',
      justifyContent: 'space-between'
    },
    amountWrapper: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignContent: 'center'
    },
    amountInput: {
      backgroundColor: 'transparent',
      height: normalize(40),
      width: '100%',
      textAlign: 'center',
      fontSize: normalize(18),
      fontFamily: 'RobotoSlab-Bold',
      letterSpacing: normalize(1.2),
      borderBottomColor: theme.colors.darkGray,
      borderBottomWidth: StyleSheet.hairlineWidth
    },
    amountInputWrapper: {
      fontSize: normalize(26),
      lineHeight: normalize(40),
      whiteSpace: 'normal',
      flexShrink: 1,
      flexGrow: 1,
      textAlign: 'right'
    },
    section: {
      flex: 1
    }
  }
}

export default withStyles(mapPropsToStyles)(AmountInput)
