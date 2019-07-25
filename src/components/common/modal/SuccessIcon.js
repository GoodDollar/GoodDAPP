// @flow
import React from 'react'
import { View } from 'react-native'
import normalize from '../../../lib/utils/normalizeText'
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
    marginBottom: normalize(16),
  },
  successIconFrame: {
    alignItems: 'center',
    borderColor: theme.colors.primary,
    borderRadius: '50%',
    borderWidth: normalize(3),
    display: 'flex',
    flexDirection: 'row',
    height: normalize(90),
    justifyContent: 'center',
    width: normalize(90),
  },
})

export default withStyles(getStylesFromProps)(SuccessIcon)
