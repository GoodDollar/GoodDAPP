import React, { useMemo } from 'react'
import { View } from 'react-native'
import { capitalize, get } from 'lodash'
import { Text } from '../../common'
import useProfile from '../../../lib/userStorage/useProfile'
import { getEventDirection } from '../../../lib/userStorage/FeedStorage'

const EventContent = ({
  style,
  textStyle,
  direction,
  description,
  hasSubtitle,
  numberOfLines = 1,
  lineHeight = 17,
  isCapitalized = true,
}) => (
  <View
    numberOfLines={1}
    style={[
      {
        flexDirection: 'row',
      },
      style,
    ]}
  >
    {!!direction && (
      <Text
        style={{
          minWidth: 10,
        }}
        textTransform={isCapitalized && 'capitalize'}
        fontSize={10}
      >
        {capitalize(direction)}:{' '}
      </Text>
    )}
    <Text
      numberOfLines={numberOfLines}
      textTransform={isCapitalized && 'capitalize'}
      fontWeight="medium"
      textAlign={'left'}
      lineHeight={lineHeight}
      style={textStyle}
    >
      {description}
    </Text>
  </View>
)

export const EventSelfParty = ({ feedItem, styles, style, textStyle, subtitle, isSmallDevice }) => {
  const direction = useMemo(() => getEventDirection(feedItem, true), [feedItem])
  const { fullName } = useProfile()

  const hasSubtitle = get(feedItem, 'data.readMore') !== false
  const senderName = get(feedItem, 'data.senderName', fullName)

  return <EventContent description={senderName} hasSubtitle={hasSubtitle} direction={direction} />
}

const EventCounterParty = ({
  feedItem,
  styles,
  style,
  textStyle,
  subtitle,
  isSmallDevice,
  numberOfLines,
  isCapitalized,
  lineHeight,
}) => {
  const direction = useMemo(() => getEventDirection(feedItem), [feedItem])
  const itemSubtitle = get(feedItem, 'data.subtitle', '')
  const selectDisplaySource =
    get(feedItem, 'data.endpoint.displayName') === 'Unknown'
      ? get(feedItem, 'data.sellerWebsite', 'Unknown')
      : get(feedItem, 'data.endpoint.displayName')

  let displayText = itemSubtitle && subtitle ? itemSubtitle : selectDisplaySource

  let hasSubtitle = get(feedItem, 'data.readMore') !== false

  return (
    <EventContent
      style={style}
      description={displayText}
      hasSubtitle={hasSubtitle}
      direction={direction}
      numberOfLines={numberOfLines}
      isCapitalized={isCapitalized}
      lineHeight={lineHeight}
      textStyle={textStyle}
    />
  )
}

export default EventCounterParty
