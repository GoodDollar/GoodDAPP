// @flow
import React from 'react'
import { StyleSheet, Text, TouchableHighlight, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import backKeyboardButton from '../../../assets/backKeyboardButton.png'

type KeyboardKeyProps = {
  keyValue: string,
  onPress: string => void
}

type KeyboardProps = {
  onPress: number => void,
  amount: number
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

const NumPadKeyboard = ({ onPress, amount }: KeyboardProps) => {
  const onPressKey = (value: string) => {
    onPress(Number(`${amount}${value}`))
  }

  const onBackspaceKey = () => {
    onPress(Number(`${amount}`.slice(0, -1)))
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
    fontWeight: 700,
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
