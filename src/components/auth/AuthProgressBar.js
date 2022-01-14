import React from 'react'
import { View } from 'react-native'

import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import { withStyles } from '../../lib/styles'

const AuthProgressBar = ({ step, done, styles, theme }) => {
  return (
    <View style={styles.mainContainer}>
      <View
        style={[
          styles.step,
          { flex: 1 },
          {
            backgroundColor: done ? theme.colors.lighterGreen : step >= 1 ? theme.colors.primary : '#EEF0F9',
          },
        ]}
      />
      <View
        style={[
          styles.step,
          { flex: 2, marginHorizontal: 10 },
          { backgroundColor: done ? theme.colors.lighterGreen : step >= 2 ? theme.colors.primary : '#EEF0F9' },
        ]}
      />
      <View
        style={[
          styles.step,
          { flex: 1 },
          { backgroundColor: done ? theme.colors.lighterGreen : step === 3 ? theme.colors.primary : '#EEF0F9' },
        ]}
      />
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
