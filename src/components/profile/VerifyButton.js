import React from 'react'
import { Text, TouchableOpacity } from 'react-native'

import { withStyles } from '../../lib/styles'

// import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../lib/utils/sizes'

const getStylesFromProps = () => ({
  verifyButton: {
    backgroundColor: '#006d9f',
    color: '#fff',
    marginVertical: 0,
    display: 'flex',
    justifyContent: 'flex-end',
    position: 'absolute',
    transitionDuration: '0s',
    padding: 11,
    borderRadius: 30,
    width: 70,
    marginRight: 20,
    paddingLeft: 11,
    paddingRight: 11,
    paddingTop: 6,
    paddingBottom: 6,
    right: -26,
    textAlign: 'center',
  },
  verifyEmail: {
    right: -15,
  },
  verifyPhone: {
    right: -26,
  },
})

const VerifyButton = ({ cb, enabled, mode, styles }) => {
  if (!enabled) {
    return null
  }

  return (
    <TouchableOpacity
      onPress={cb}
      style={[styles.verifyButton, mode === 'phone' ? styles.verifyPhone : styles.verifyEmail]}
    >
      <Text style={{ color: 'white' }}> Verify </Text>
    </TouchableOpacity>
  )
}

export default withStyles(getStylesFromProps)(VerifyButton)
