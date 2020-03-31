// @flow
import React, { useMemo } from 'react'
import InputWithAdornment from './InputWithAdornment'

const InputText = ({ showCleanAdornment, ...props }) => {
  const action = useMemo(() => {
    return showCleanAdornment && props.onChangeText ? () => props.onChangeText('') : undefined
  }, [showCleanAdornment, props])

  return <InputWithAdornment {...props} adornment="close" adornmentAction={action} />
}

export default InputText
