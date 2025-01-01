import React from 'react'
import { View } from 'react-native'
import { CheckBox as WebCheckBox } from 'react-native-web'
import RNCheckBox from '@react-native-community/checkbox'
import { isMobileNative } from '../../../lib/utils/platform'
import { withStyles } from '../../../lib/styles'

const CheckBoxComponent = isMobileNative ? RNCheckBox : WebCheckBox
const CheckBox = ({ onClick, value, styles, children }) => (
  <View style={styles.container}>
    <CheckBoxComponent value={value} onValueChange={onClick} style={styles.checkbox} />
    {children}
  </View>
)

const mapStylesToProps = () => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
})

export default withStyles(mapStylesToProps)(CheckBox)

// export default CheckBox
