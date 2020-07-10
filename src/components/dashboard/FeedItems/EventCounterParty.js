import React from 'react'
import { Text } from '../../common'
import { withStyles } from '../../../lib/styles'

const EventCounterParty = ({ feedItem, styles, style, textStyle, subtitle, isSmallDevice }) => {
  let direction = ''
  let displayText =
    feedItem.data.subtitle && subtitle ? `${feedItem.data.subtitle}` : `${feedItem.data.endpoint.fullName}`

  let hasSubtitle = feedItem.data.readMore !== false
  switch (feedItem.type) {
    case 'send':
      direction = 'To: '
      break

    case 'claim':
    case 'receive':
    case 'withdraw':
    case 'bonus':
      direction = 'From: '
      break

    default:
      break
  }

  return (
    <Text
      textTransform="capitalize"
      textAlign="left"
      style={[{ height: '100%' }, style]}
      numberOfLines={2}
      ellipsizeMode="tail"
    >
      {direction && (
        <Text fontSize={10} lineHeight={(textStyle && textStyle.lineHeight) || 16} style={styles.direction}>
          {direction}
        </Text>
      )}
      <Text
        fontWeight="medium"
        textAlign={'left'}
        lineHeight={hasSubtitle ? 19 : 38}
        style={[styles.fullName, textStyle]}
      >
        {displayText}
      </Text>
    </Text>
  )
}

const getStylesFromProps = () => ({
  direction: {
    marginRight: 3,
  },
})

export default withStyles(getStylesFromProps)(EventCounterParty)
