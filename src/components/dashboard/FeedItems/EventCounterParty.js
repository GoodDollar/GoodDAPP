import React from 'react'
import { Text } from '../../common'
import { withStyles } from '../../../lib/styles'

const EventCounterParty = ({ feedItem, styles, style, subtitle }) => {
  const direction =
    feedItem.type === 'send'
      ? 'To:'
      : ['claim', 'receive', 'withdraw', 'bonus'].indexOf(feedItem.type) > -1
      ? 'From:'
      : ''
  return (
    <Text textTransform="capitalize" textAlign="left" style={style} numberOfLines={1} ellipsizeMode="tail">
      {direction && (
        <Text fontSize={10} style={styles.direction}>
          {direction}
        </Text>
      )}
      <Text fontWeight="medium" lineHeight={19} style={styles.fullName}>
        {feedItem.data.subtitle && subtitle ? ` ${feedItem.data.subtitle}` : ` ${feedItem.data.endpoint.fullName}`}
      </Text>
    </Text>
  )
}

const getStylesFromProps = ({ theme }) => ({
  direction: {
    textAlignVertical: 'middle',
    marginRight: 3,
  },
  fullName: {
    textAlignVertical: 'middle',
  },
})

export default withStyles(getStylesFromProps)(EventCounterParty)
