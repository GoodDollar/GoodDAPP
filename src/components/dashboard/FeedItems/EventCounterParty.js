import React, { useMemo } from 'react'
import { get } from 'lodash'
import { Text } from '../../common'
import { withStyles } from '../../../lib/styles'
import { getEventDirection } from '../../../lib/userStorage/FeedStorage'

const getStylesFromProps = () => ({
  direction: {
    marginRight: 3,
  },
})

const EventContent = withStyles(getStylesFromProps)(
  ({ style, styles, textStyle, direction, description, hasSubtitle }) => (
    <Text textTransform="capitalize" textAlign="left" style={style} numberOfLines={2} ellipsizeMode="tail">
      {direction && (
        <Text fontSize={10} lineHeight={(textStyle && textStyle.lineHeight) || 16} style={styles.direction}>
          {direction}
        </Text>
      )}
      <Text
        fontWeight="medium"
        textAlign={'left'}
        lineHeight={hasSubtitle ? 16 : 38}
        style={[styles.fullName, textStyle]}
      >
        {description}
      </Text>
    </Text>
  ),
)

export const EventSelfParty = ({ feedItem, styles, style, textStyle, subtitle, isSmallDevice }) => {
  const direction = useMemo(() => getEventDirection(feedItem, true), [feedItem])

  let hasSubtitle = get(feedItem, 'data.readMore') !== false

  return <EventContent description={feedItem?.data?.senderName} hasSubtitle={hasSubtitle} direction={direction} />
}

const EventCounterParty = ({ feedItem, styles, style, textStyle, subtitle, isSmallDevice }) => {
  const direction = useMemo(() => getEventDirection(feedItem), [feedItem])
  const itemSubtitle = get(feedItem, 'data.subtitle', '')
  const selectDisplaySource =
    get(feedItem, 'data.endpoint.displayName') === 'Unknown'
      ? get(feedItem, 'data.sellerWebsite', 'Unknown')
      : get(feedItem, 'data.endpoint.displayName')

  let displayText = itemSubtitle && subtitle ? itemSubtitle : selectDisplaySource

  let hasSubtitle = get(feedItem, 'data.readMore') !== false

  return <EventContent description={displayText} hasSubtitle={hasSubtitle} direction={direction} />
}

export default EventCounterParty
