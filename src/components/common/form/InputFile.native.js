// @flow
import React from 'react'
import ImagePicker from 'react-native-image-crop-picker'
import { useActionSheet } from '@expo/react-native-action-sheet'
import useOnPress from '../../../lib/hooks/useOnPress'

export const useFileInput = ({ pickerOptions, onChange }) => {
  const { showActionSheetWithOptions } = useActionSheet()

  const handleSheetClick = async buttonIndex => {
    const actions = [ImagePicker.openCamera, ImagePicker.openPicker]
    const action = actions[buttonIndex]

    if (!action) {
      return
    }

    const image = await action(pickerOptions)
    const imageData = `data:${image.mime};base64,${image.data}`

    onChange(imageData)
  }

  const openSheet = useOnPress(() => {
    const sheetOptions = {
      options: ['Open Camera', 'Choose from library', 'Close'],
      cancelButtonIndex: 2,
    }

    showActionSheetWithOptions(sheetOptions, handleSheetClick)
  }, [handleSheetClick, showActionSheetWithOptions])

  return openSheet
}

const InputFile = ({ Component, pickerOptions, onChange }) => {
  const trigger = useFileInput({ pickerOptions, onChange })
  return <Component onPress={trigger} />
}
export default InputFile
