// @flow
import React from 'react'
import { StyleSheet, Text, TouchableHighlight, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { moneyRegexp } from '../../../lib/wallet/utils'
import backKeyboardButton from '../../../assets/backKeyboardButton.png'

type KeyboardKeyProps = {
  keyValue: string,
  onPress: string => void
}

type CaretPosition = {
  start: number,
  end: number
}

type KeyboardProps = {
  onPress: string => void,
  amount: string,
  caretPosition?: CaretPosition,
  updateCaretPosition?: CaretPosition => void
}

type KeyboardRowProps = {
  onPress: string => void,
  keys: Array<string>
}

const KeyboardKey = ({ keyValue, onPress }: KeyboardKeyProps) => {
  return (
    <TouchableHighlight style={styles.key} onPress={() => onPress(keyValue)} activeOpacity={0.8} underlayColor="#eee">
      {keyValue === 'backspace' ? (
        <View style={styles.backspaceButton} />
      ) : (
        <Text style={styles.keyText}>{keyValue}</Text>
      )}
    </TouchableHighlight>
  )
}

const KeyboardRow = ({ keys, onPress }: KeyboardRowProps) => (
  <View style={styles.row}>
    {keys.map(key => (
      <KeyboardKey keyValue={key} onPress={onPress} key={key} />
    ))}
  </View>
)

const NumPadKeyboard = ({ onPress, amount, caretPosition, updateCaretPosition }: KeyboardProps) => {
  const onPressKey = (value: string) => {
    const stringAmount = `${amount}`
    const updatedValue = caretPosition
      ? [stringAmount.slice(0, caretPosition.start), value, stringAmount.slice(caretPosition.end)].join('')
      : `${stringAmount}${value}`

    if (moneyRegexp.test(updatedValue)) {
      onPress(updatedValue)
      updateCaretPosition({
        start: caretPosition.start + 1,
        end: caretPosition.start + 1
      })
    }
  }

  const onBackspaceKey = () => {
    if (!caretPosition || caretPosition.end > 0) {
      const stringAmount = `${amount}`
      let updatedValue = stringAmount.slice(0, -1)
      if (caretPosition) {
        updatedValue = [stringAmount.slice(0, caretPosition.start - 1), stringAmount.slice(caretPosition.end)].join('')
        updateCaretPosition({
          start: caretPosition.start - 1,
          end: caretPosition.start - 1
        })
      }
      onPress(updatedValue)
    }
  }

  return (
    <View style={styles.keyboard}>
      <KeyboardRow keys={['1', '2', '3']} onPress={onPressKey} />
      <KeyboardRow keys={['4', '5', '6']} onPress={onPressKey} />
      <KeyboardRow keys={['7', '8', '9']} onPress={onPressKey} />
      <View style={styles.row}>
        <KeyboardKey keyValue="." onPress={onPressKey} />
        <KeyboardKey keyValue="0" onPress={onPressKey} />
        <KeyboardKey keyValue="backspace" onPress={onBackspaceKey} />
      </View>
    </View>
  )
}

NumPadKeyboard.defaultProps = {
  caretPosition: null,
  updateCaretPosition: () => {}
}

const styles = StyleSheet.create({
  keyboard: {
    display: 'flex',
    padding: normalize(10)
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  key: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    padding: normalize(15),
    cursor: 'pointer'
  },
  keyText: {
    fontSize: normalize(20),
    fontFamily: 'RobotoSlab-Bold',
    fontWeight: '700',
    color: '#42454a'
  },
  backspaceButton: {
    backgroundImage: `url(${backKeyboardButton})`,
    height: normalize(25),
    width: normalize(25),
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    cursor: 'pointer'
  }
})

export default NumPadKeyboard
