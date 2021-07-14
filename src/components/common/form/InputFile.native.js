// @flow
import React, { useCallback } from 'react'
import ImagePicker from 'react-native-image-crop-picker'
import { useActionSheet } from '@expo/react-native-action-sheet'

import useOnPress from '../../../lib/hooks/useOnPress'
import { mimeToExtension } from '../../../lib/utils/image'

const { openCamera, openPicker } = ImagePicker
const actions = [openCamera, openPicker]

export const useFileInput = ({ pickerOptions, onChange }) => {
  const { showActionSheetWithOptions } = useActionSheet()

  const handleSheetClick = useCallback(
    async buttonIndex => {
      const action = actions[buttonIndex]

      if (!action) {
        return
      }

      let { mime, data, filename } = await action(pickerOptions)

      if (!filename) {
        const dotExtension = mimeToExtension(mime, { withDot: true })

        filename = 'avatar' + dotExtension
      }

      const imageRecord = { mime, filename, base64: data }

      onChange(imageRecord)
    },
    [onChange],
  )

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
