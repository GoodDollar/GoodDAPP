// @flow
import React, { useEffect, useState } from 'react'
import { TextInput, View } from 'react-native'
import { withStyles } from '../../../lib/styles'

// keyCode constants
const BACKSPACE = 8
const LEFT_ARROW = 37
const RIGHT_ARROW = 39
const DELETE = 46

type Props = {
  numInputs: number,
  onChange: Function,
  separator?: Object,
  containerStyle?: Object,
  inputStyle?: Object,
  focusStyle?: Object,
  isDisabled?: boolean,
  disabledStyle?: Object,
  hasErrored?: boolean,
  errorStyle?: Object,
  shouldAutoFocus?: boolean,
  isInputNum?: boolean,
  value?: string | array,
  keyboardType?: string,
  placeholder?: string,
  styles: any,
}

type SingleOtpInputProps = {
  separator?: Object,
  isLastChild?: boolean,
  inputStyle?: Object,
  focus?: boolean,
  isDisabled?: boolean,
  hasErrored?: boolean,
  errorStyle?: Object,
  focusStyle?: Object,
  disabledStyle?: Object,
  shouldAutoFocus?: boolean,
  isInputNum?: boolean,
  value?: string,
  styles: Object,
  placeholder: string,
  onChange: any,
  keyboardType?: string,
}

const getSingleOtpInputStylesFromProps = ({ theme }) => ({
  singleOtpInputContainer: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: '0.4rem',
  },
  input: {
    textAlign: 'center',
    width: '100%',
    height: '3rem',
    marginVertical: 0,
    fontSize: '1.5rem',
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderLeftWidth: 0,
    borderBottomColor: theme.colors.gray,
    borderBottomWidth: 2,
  },
})

const Input = ({ min, max, pattern, focus, shouldAutoFocus, onChange, value, focusNextInput, ...props }) => {
  let input: ?HTMLInputElement = null
  const [selection, setSelection] = useState({ start: 0, end: value && value.length ? 1 : 0 })

  // Focus on first render
  // Only when shouldAutoFocus is true
  useEffect(() => {
    if (input && focus && shouldAutoFocus) {
      input.focus()
      setSelection({ start: 0, end: value && value.length ? 1 : 0 })
    }
  }, [])

  // Check if focusedInput changed
  // Prevent calling function if input already in focus
  useEffect(() => {
    if (input && focus) {
      input.focus()
      setSelection({ start: 0, end: value && value.length ? 1 : 0 })
    }
  }, [focus])

  const handleSelection = ({ nativeEvent: { selection: nativeSelection } }) => {
    if (nativeSelection.start === nativeSelection.end && nativeSelection.start === 1) {
      focusNextInput()
    }
    setSelection({ start: 0, end: value && value.length ? 1 : 0 })
  }

  const handleValidation = (inputValue: number | string): boolean =>
    (!min || inputValue >= min) && (!max || inputValue <= max) && (!pattern || pattern.test(inputValue))

  const handleOnChange = (e: Object) => {
    e.preventDefault()
    const value = e.target.value
    const isValid = handleValidation(value)
    if (isValid && onChange) {
      onChange(value)
    }
  }
  return (
    <TextInput
      {...props}
      value={value}
      onChange={handleOnChange}
      ref={inputRef => (input = inputRef)}
      onSelectionChange={handleSelection}
      selection={selection}
      selectTextOnFocus={true}
    />
  )
}

const SingleOtpInput = withStyles(getSingleOtpInputStylesFromProps)((props: SingleOtpInputProps) => {
  const {
    separator,
    isLastChild,
    inputStyle,
    focus,
    isDisabled,
    hasErrored,
    errorStyle,
    focusStyle,
    disabledStyle,
    isInputNum,
    value,
    styles,
    placeholder,
    keyboardType,
    ...rest
  } = props

  const inputStyles = [styles.input, inputStyle]
  if (focus && focusStyle) {
    inputStyles.push(focusStyle)
  }
  if (isDisabled && disabledStyle) {
    inputStyles.push(disabledStyle)
  }
  if (hasErrored && errorStyle) {
    inputStyles.push(errorStyle)
  }
  const inputProps = {
    style: inputStyles,
    maxLength: 1,
    disabled: isDisabled,
    value: value && value !== ' ' ? value : '',
    returnKeyType: 'next',
    placeholder,
    focus,
  }
  const inputValidations = isInputNum
    ? {
        min: 0,
        max: 9,
        pattern: /\d/g,
        type: 'number',
        keyboardType: keyboardType || 'phone-pad',
      }
    : {
        type: 'tel',
        keyboardType: keyboardType || 'default',
      }
  return (
    <View style={styles.singleOtpInputContainer}>
      <Input {...inputProps} {...inputValidations} {...rest} />
      {!isLastChild && separator}
    </View>
  )
})

const OtpInput = (props: Props) => {
  const {
    value,
    onChange,
    numInputs,
    inputStyle,
    focusStyle,
    separator,
    isDisabled,
    disabledStyle,
    hasErrored,
    errorStyle,
    shouldAutoFocus,
    isInputNum,
    containerStyle,
    placeholder,
    styles,
    keyboardType,
  } = props

  const [activeInput, setActiveInput] = useState(0)

  const getOtpValue = () => (value ? (Array.isArray(value) ? value : value.toString().split('')) : [])

  // Helper to return OTP from input
  const handleOtpChange = (otp: string[]) => {
    onChange(otp)
  }

  // Focus on input by index
  const focusInput = (input: number) => {
    const activeInput = Math.max(Math.min(numInputs - 1, input), 0)
    setActiveInput(activeInput)
  }

  // Focus on next input
  const focusNextInput = () => {
    focusInput(activeInput + 1)
  }

  // Focus on previous input
  const focusPrevInput = () => focusInput(activeInput - 1)

  // Change OTP value at focused input
  const changeCodeAtFocus = (inputValue: string, position?: number) => {
    const otp = getOtpValue()
    const pos = position || position === 0 ? position : activeInput
    otp[pos] = inputValue[0]
    handleOtpChange(otp)
  }

  // Handle pasted OTP
  const handleOnPaste = (e: Object) => {
    e.preventDefault()
    const otp = getOtpValue()

    // Get pastedData in an array of max size (num of inputs - current position)
    const pastedData = e.clipboardData
      .getData('text/plain')
      .slice(0, numInputs - activeInput)
      .split('')

    // Paste data from focused input onwards
    for (let pos = 0; pos < numInputs; ++pos) {
      if (pos >= activeInput && pastedData.length > 0) {
        otp[pos] = pastedData.shift()
      }
    }
    handleOtpChange(otp)
  }

  const handleOnChange = (inputValue: string) => {
    changeCodeAtFocus(inputValue)
    focusNextInput()
  }

  // Handle cases of backspace, delete, left arrow, right arrow
  const handleOnKeyPress = (e: Object) => {
    if (e.keyCode === BACKSPACE || e.key === 'Backspace') {
      e.preventDefault()
      if (e.target.value.length === 0 && activeInput > 0) {
        changeCodeAtFocus('', activeInput - 1)
        focusPrevInput()
      }
      changeCodeAtFocus('')
    } else if (e.keyCode === DELETE || e.key === 'Delete') {
      e.preventDefault()
      changeCodeAtFocus('')
    } else if (e.keyCode === LEFT_ARROW || e.key === 'ArrowLeft') {
      e.preventDefault()
      focusPrevInput()
    } else if (e.keyCode === RIGHT_ARROW || e.key === 'ArrowRight') {
      e.preventDefault()
      focusNextInput()
    }
  }

  const checkLength = (e: Object) => {
    if (e.target.value.length > 1) {
      e.preventDefault()
      focusNextInput()
    }
    const otp = getOtpValue()
    if (e.target.value === otp[activeInput]) {
      focusNextInput()
    }
  }

  const renderInputs = () => {
    const otp = getOtpValue()
    const inputs = []
    const customPlaceholder = otp.some(value => value !== null && value !== undefined) ? '' : placeholder

    for (let i = 0; i < numInputs; i++) {
      inputs.push(
        <SingleOtpInput
          key={i}
          focus={activeInput === i}
          value={otp && otp[i]}
          onChange={handleOnChange}
          onKeyPress={handleOnKeyPress}
          onInput={checkLength}
          onPaste={handleOnPaste}
          onFocus={e => {
            setActiveInput(i)
            e.target.select()
          }}
          onBlur={() => setActiveInput(-1)}
          separator={separator}
          inputStyle={inputStyle}
          focusStyle={focusStyle}
          isLastChild={i === numInputs - 1}
          isDisabled={isDisabled}
          disabledStyle={disabledStyle}
          hasErrored={hasErrored}
          errorStyle={errorStyle}
          shouldAutoFocus={shouldAutoFocus}
          isInputNum={isInputNum}
          placeholder={customPlaceholder}
          keyboardType={keyboardType || null}
        />
      )
    }
    return inputs
  }

  return <View style={[styles.mainContainer, containerStyle]}>{renderInputs()}</View>
}

const getStylesFromProps = ({ theme }) => ({
  mainContainer: {
    display: 'flex',
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    marginBottom: theme.sizes.default,
  },
})

OtpInput.defaultProps = {
  numInputs: 4,
  onChange: (otp: number): void => undefined,
  isDisabled: false,
  shouldAutoFocus: false,
  value: '',
}

export default withStyles(getStylesFromProps)(OtpInput)
