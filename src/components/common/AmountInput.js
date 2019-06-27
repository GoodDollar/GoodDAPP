// @flow
import React, { useState } from 'react'
import { Keyboard, Text, TouchableWithoutFeedback, View } from 'react-native'
import { isMobile } from 'mobile-device-detect'
import { receiveStyles as styles } from '../dashboard/styles'
import InputGoodDollar from './InputGoodDollar'
import NumPadKeyboard from './NumPadKeyboard'
import Section from './Section'

type AmountInputProps = {
  amount: string,
  handleAmountChange: string => void
}

const AmountInput = ({ amount, handleAmountChange }: AmountInputProps) => {
  const [caretPosition, setCaretPosition] = useState({ start: 0, end: 0 })

  return (
    <View style={styles.inputField}>
      <Section.Title style={styles.headline}>How much?</Section.Title>
      <View style={styles.amountWrapper}>
        <TouchableWithoutFeedback
          onPress={() => (isMobile ? Keyboard.dismiss() : null)}
          accessible={false}
          style={styles.section}
        >
          <View style={styles.section}>
            <Text style={styles.amountInputWrapper}>
              <InputGoodDollar
                disabled={isMobile}
                autoFocus
                style={styles.amountInput}
                amount={amount}
                onChangeAmount={handleAmountChange}
                onSelectionChange={setCaretPosition}
              />
            </Text>
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

export default AmountInput
