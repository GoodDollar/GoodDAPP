// @flow
import React from 'react'
import ImagePicker from 'react-native-image-crop-picker'
import { useActionSheet } from '@expo/react-native-action-sheet'

import useOnPress from '../../../lib/hooks/useOnPress'
import { assembleDataUrl } from '../../../lib/utils/base64'

export const useFileInput = ({ pickerOptions, onChange }) => {
  const { showActionSheetWithOptions } = useActionSheet()

  const handleSheetClick = async buttonIndex => {
    const actions = [ImagePicker.openCamera, ImagePicker.openPicker]
    const action = actions[buttonIndex]

    if (!action) {
      return
    }

    const { mime, data } = await action(pickerOptions)
    const dataUrl = assembleDataUrl(data, mime)

    onChange(dataUrl)
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
