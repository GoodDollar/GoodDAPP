import React, { useState } from 'react'
import Icon from 'react-native-elements/src/icons/Icon'
import { StyleSheet, View } from 'react-native'

import Clipboard from '../../lib/utils/Clipboard'
import CustomButton from './CustomButton'

const DoneIcon = ({ disabled, mode }) => {
  const primaryColor = 'white'
  const secondaryColor = disabled ? 'rgba(0, 0, 0, 0.32)' : '#282c34'
  return (
    <Icon
      size={16}
      name="done"
      reverse
      color={mode === 'contained' ? secondaryColor : primaryColor}
      reverseColor={mode === 'contained' ? primaryColor : secondaryColor}
    />
  )
}

const CopyButton = ({ toCopy, children, ...props }) => {
  const mode = props.mode || 'contained'
  const [copied, setCopied] = useState(false)
  return copied ? (
    <View style={styles.iconButtonWrapper}>
      <DoneIcon mode={mode} />
    </View>
  ) : (
    <CustomButton
      mode={mode}
      onPress={() => {
        Clipboard.setString(toCopy)
        setCopied(true)
      }}
      {...props}
    >
      {children || 'Copy to Clipboard'}
    </CustomButton>
  )
}

export default CopyButton

const styles = StyleSheet.create({
  iconButtonWrapper: {
    flexDirection: 'column',
    alignItems: 'center'
  }
})
