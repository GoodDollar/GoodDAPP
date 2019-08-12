import React from 'react'
import { Text } from '../../common'
import { withStyles } from '../../../lib/styles'

const EventCounterParty = ({ feedItem, styles, style, theme }) => {
  const direction =
    feedItem.type === 'send' ? 'To:' : ['claim', 'receive', 'withdraw'].indexOf(feedItem.type) > -1 ? 'From:' : ''
  const withdrawStatusText =
    feedItem.type === 'send' && feedItem.data.endpoint.withdrawStatus
      ? ` by link - ${feedItem.data.endpoint.withdrawStatus}`
      : ''
  return (
    <Text
      color={theme.fontStyle.color}
      textTransform="capitalize"
      textAlign="left"
      style={[styles.rowDataText, style]}
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      <Text fontSize={10} style={styles.direction}>
        {direction}
      </Text>
      <Text fontWeight={500} style={styles.fullName}>{` ${feedItem.data.endpoint.fullName}${withdrawStatusText}`}</Text>
    </Text>
  )
}

const getStylesFromProps = ({ theme }) => ({
  direction: {
    textAlignVertical: 'middle',
  },
  fullName: {
    textAlignVertical: 'middle',
  },
})

export default withStyles(getStylesFromProps)(EventCounterParty)
