// @flow
import React from 'react'
import InputWithAddons from './InputWithAddons'

const InputText = ({
  showAdornment,
  adornment,
  adornmentSize,
  adornmentStyle,
  adornmentColor,
  adornmentDisabled,
  adornmentAction,
  ...props
}) => {
  return (
    <InputWithAddons
      {...props}
      {...showAdornment && {
        suffixIcon: adornment,
        suffixDisabled: false,
        suffixIconSize: adornmentSize,
        suffixStyle: adornmentStyle,
        suffixColor: adornmentColor,
        onSuffixClick: adornmentAction,
      }}
    />
  )
}

export default InputText
