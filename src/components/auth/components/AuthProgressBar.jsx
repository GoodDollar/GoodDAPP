import React, { useCallback } from 'react'
import { View } from 'react-native'
import { range } from 'lodash'

import { getDesignRelativeHeight } from '../../../lib/utils/sizes'
import { withStyles } from '../../../lib/styles'

const steps = range(1, 4).map(id => ({ id, wide: id === 2 }))

const AuthProgressBar = ({ step, done, styles, theme }) => {
  const isStepActive = useCallback(id => step >= id, [step])

  return (
    <View style={styles.mainContainer}>
      {steps.map(({ id, wide }) => (
        <View
          key={id}
          style={[styles.step, wide && styles.wideStep, done ? styles.doneStep : isStepActive(id) && styles.activeStep]}
        />
      ))}
    </View>
  )
}

const getStylesFromProps = ({ theme }) => {
  const { lighterGreen, primary } = theme.colors

  return {
    mainContainer: {
      flexDirection: 'row',
      marginTop: getDesignRelativeHeight(5),
    },
    step: {
      height: getDesignRelativeHeight(8),
      backgroundColor: '#EEF0F9',
      flex: 1,
    },
    wideStep: {
      flex: 2,
      marginHorizontal: 10,
    },
    activeStep: {
      backgroundColor: primary,
    },
    doneStep: {
      backgroundColor: lighterGreen,
    },
  }
}

export default withStyles(getStylesFromProps)(AuthProgressBar)
