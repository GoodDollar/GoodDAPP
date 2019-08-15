import React from 'react'
import { Text } from '../../common'
import { withStyles } from '../../../lib/styles'

const EventCounterParty = ({ feedItem, styles, style, theme }) => {
  const direction =
    feedItem.type === 'send' ? 'To:' : ['claim', 'receive', 'withdraw'].indexOf(feedItem.type) > -1 ? 'From:' : ''
  return (
    <Text
      color="darkGray"
      textTransform="capitalize"
      textAlign="left"
      style={[styles.rowDataText, style]}
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      <Text fontSize={10} style={styles.direction} color="darkGray">
        {direction}
      </Text>
      <Text fontWeight={500} style={styles.fullName} color="darkGray">
        {` ${feedItem.data.endpoint.fullName}`}
      </Text>
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
