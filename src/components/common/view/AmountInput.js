// @flow
import React, { useEffect, useState } from 'react'
import { Keyboard, Platform, TouchableWithoutFeedback, View } from 'react-native'
import { isMobile } from '../../../lib/utils/platform'
import SectionTitle from '../layout/SectionTitle'
import InputGoodDollar from '../form/InputGoodDollar'
import { withStyles } from '../../../lib/styles'
import { getDesignRelativeHeight } from '../../../lib/utils/sizes'
import useOnPress from '../../../lib/hooks/useOnPress'
import NumPadKeyboard from './NumPadKeyboard'

type AmountInputProps = {
  amount: string,
  handleAmountChange: Function,
  styles: any,
  title?: string,
  error?: string,
  maxLength?: number,
}

const AmountInput = ({ amount, handleAmountChange, styles, error, title, maxLength }: AmountInputProps) => {
  const [caretPosition, setCaretPosition] = useState({ start: 0, end: 0 })

  useEffect(() => {
    const position = amount ? `${amount}`.length : 0
    setCaretPosition({
      start: position,
      end: position,
    })
  }, [])

  const handlePress = useOnPress(() => (isMobile ? Keyboard.dismiss() : null), [isMobile])

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {title && <SectionTitle fontWeight="medium">{title}</SectionTitle>}
        <TouchableWithoutFeedback onPress={handlePress} accessible={false} style={styles.section}>
          <InputGoodDollar
            style={error ? styles.errorInput : styles.section}
            editable={!isMobile}
            autoFocus
            amount={amount}
            onChangeAmount={handleAmountChange}
            onSelectionChange={setCaretPosition}
            error={error}
            maxLength={maxLength}
          />
        </TouchableWithoutFeedback>
      </View>
      <NumPadKeyboard
        isMaxLength={maxLength === amount.length}
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
    section: {
      marginTop: Platform.select({
        web: getDesignRelativeHeight(34, false),
        default: 40,
      }),
    },
    container: {
      minHeight: getDesignRelativeHeight(180),
      height: getDesignRelativeHeight(180),
    },
    errorInput: {
      color: theme.colors.error,
      borderBottomColor: theme.colors.error,
      marginTop: 40,
    },
  }
}

export default withStyles(mapPropsToStyles)(AmountInput)
