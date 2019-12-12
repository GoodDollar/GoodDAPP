import { useEffect, useState } from 'react'
import { Keyboard } from 'react-native'

export const useKeyboard = () => {
  const [isShowKeyboard, setShowKeyboard] = useState(false)

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', () => setShowKeyboard(true))
    Keyboard.addListener('keyboardDidHide', () => setShowKeyboard(false))
  }, [])

  return isShowKeyboard
}
