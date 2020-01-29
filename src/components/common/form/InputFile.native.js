// @flow
import React from 'react'
import { TouchableOpacity } from 'react-native'
import ImagePicker from 'react-native-image-crop-picker'
import { connectActionSheet, useActionSheet } from '@expo/react-native-action-sheet'

type Props = {
  onChange: Function,
  style?: any,
  children?: any,
}

const InputFile = ({ onChange, style, children, pickerOptions }: Props) => {
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

  const openSheet = () => {
    const sheetOptions = {
      options: ['Open Camera', 'Choose from library', 'Close'],
      cancelButtonIndex: 2,
    }

    showActionSheetWithOptions(sheetOptions, handleSheetClick)
  }

  return (
    <TouchableOpacity onPress={openSheet} style={style}>
      {children}
    </TouchableOpacity>
  )
}

export default connectActionSheet(InputFile)
