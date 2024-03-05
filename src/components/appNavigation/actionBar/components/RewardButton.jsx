import React, { memo } from 'react'
import { Platform, TouchableOpacity } from 'react-native'
import { withStyles } from '../../../../lib/styles'
import Icon from '../../../common/view/Icon'

const getStylesFromProps = ({ theme }) => ({
  notifications: {
    width: 13.3,
    height: 13.3,
    backgroundColor: theme.colors.orange,
    borderRadius: 7,
    position: 'absolute',
    top: Platform.select({
      web: '-10%',
      default: '5%',
    }),
    left: Platform.select({
      web: '70%',
      default: '55%',
    }),
  },
})

const RewardButton = memo(({ onPress, style, styles }) => {
  return (
    <>
      <TouchableOpacity testID="rewards_tab" onPress={onPress} style={style}>
        <Icon name="rewards-alt" size={48} color="white" />
      </TouchableOpacity>
    </>
  )
})

export default withStyles(getStylesFromProps)(RewardButton)
