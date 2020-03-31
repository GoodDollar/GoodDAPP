import React from 'react'
import { Text } from '../../common'
import { withStyles } from '../../../lib/styles'
import cutLastWords from '../../../lib/utils/cutLastWords'

const EventCounterParty = ({ feedItem, styles, style, textStyle, subtitle, isSmallDevice }) => {
  let direction = ''
  let displayText =
    feedItem.data.subtitle && subtitle ? `${feedItem.data.subtitle}` : `${feedItem.data.endpoint.fullName}`

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

    case 'claiming':
      displayText = isSmallDevice ? cutLastWords(displayText, 2) : displayText
      break

    default:
      break
  }

  return (
    <Text textTransform="capitalize" textAlign="left" style={style} numberOfLines={2} ellipsizeMode="tail">
      {direction && (
        <Text fontSize={10} style={styles.direction}>
          {direction}
        </Text>
      )}
      <Text fontWeight="medium" lineHeight={19} style={[styles.fullName, textStyle]}>
        {displayText}
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
