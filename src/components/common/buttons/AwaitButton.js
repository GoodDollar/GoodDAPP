import React from 'react'
import { ActivityIndicator } from 'react-native-paper'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'

import CustomButton from './CustomButton'

const AwaitButton = ({ styles, theme, size, children, ...props }) => {
  const mode = props.mode || 'contained'

  if (props.isLoading) {
    return (
      <CustomButton mode={mode}>
        <View style={styles.iconButtonWrapper}>
          <ActivityIndicator color={theme.feedItems.itemBackgroundColor} size={size} />
        </View>
      </CustomButton>
    )
  }

  return (
    <CustomButton mode={mode} {...props}>
      {children}
    </CustomButton>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    ActivityIndicatorWrapper: {
      minHeight: 28,
      justifyContent: 'center',
    },
  }
}

export default withStyles(getStylesFromProps)(AwaitButton)
