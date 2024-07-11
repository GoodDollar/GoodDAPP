import React from 'react'
import { TouchableOpacity } from 'react-native'
import { default as RNCheckBox } from '@react-native-community/checkbox'

import { withStyles } from '../../../lib/styles'

const CheckBox = ({ onClick, value, styles, children }) => (
  <TouchableOpacity onPress={onClick} style={styles.container}>
    <RNCheckBox value={value} onValueChange={onClick} style={styles.checkbox} tintColors={{ true: '#00AEFF' }} />
    {children}
  </TouchableOpacity>
)

const mapStylesToProps = () => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
  },
})

export default withStyles(mapStylesToProps)(CheckBox)
