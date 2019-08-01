// @flow
import React from 'react'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import Icon from '../view/Icon'

const SuccessIcon = ({ styles, style, theme }) => (
  <View style={[styles.successIconContainer, style]}>
    <View style={styles.successIconFrame}>
      <Icon name="success" color={theme.colors.primary} size={30} />
    </View>
  </View>
)

const getStylesFromProps = ({ theme }) => ({
  successIconContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.sizes.defaultDouble,
  },
  successIconFrame: {
    alignItems: 'center',
    borderColor: theme.colors.primary,
    borderRadius: '50%',
    borderWidth: 3,
    display: 'flex',
    flexDirection: 'row',
    height: 90,
    justifyContent: 'center',
    width: 90,
  },
})

export default withStyles(getStylesFromProps)(SuccessIcon)
