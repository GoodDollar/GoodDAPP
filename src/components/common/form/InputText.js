// @flow
import React, { useCallback } from 'react'
import InputWithAdornment from './InputWithAdornment'

const InputText = ({ showCleanAdornment, onChangeText, ...props }) => {
  const action = useCallback(() => onChangeText(''), [onChangeText])

  return (
    <InputWithAdornment
      {...props}
      showAdornment={!!showCleanAdornment && !!onChangeText}
      adornment="close"
      adornmentAction={action}
      onChangeText={onChangeText}
    />
  )
}

export default InputText
