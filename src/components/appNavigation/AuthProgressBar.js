import React from 'react'
import { View } from 'react-native'

import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import { withStyles } from '../../lib/styles'

const AuthProgressBar = ({ step, styles, theme }) => {
  return (
    <View style={styles.mainContainer}>
      <View style={[styles.step, { flex: 1 }, step === 1 && { backgroundColor: theme.colors.primary }]} />
      <View
        style={[
          styles.step,
          { flex: 2, marginHorizontal: 10 },
          step === 2 && { backgroundColor: theme.colors.primary },
        ]}
      />
      <View style={[styles.step, { flex: 1 }, step === 3 && { backgroundColor: theme.colors.primary }]} />
    </View>
  )
}

const getStylesFromProps = ({ theme }) => ({
  mainContainer: {
    flexDirection: 'row',
    marginTop: getDesignRelativeHeight(5),
  },
  step: {
    height: getDesignRelativeHeight(8),
    backgroundColor: '#EEF0F9',
  },
})

export default withStyles(getStylesFromProps)(AuthProgressBar)
