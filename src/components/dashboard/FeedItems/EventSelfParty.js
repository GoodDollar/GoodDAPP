import React from 'react'
import { get } from 'lodash'
import { Text } from '../../common'
import { withStyles } from '../../../lib/styles'
import useProfile from '../../../lib/userStorage/useProfile'
import useEventDirection from '../../../lib/hooks/useEventDirection'

const EventSelfParty = ({ feedItem, styles, style, textStyle, subtitle, isSmallDevice }) => {
  const direction = useEventDirection(feedItem.type, true)
  const { fullName } = useProfile()

  let hasSubtitle = get(feedItem, 'data.readMore') !== false

  return (
    <Text
      textTransform="capitalize"
      textAlign="left"
      style={[{ height: '100%', flex: 1 }, style]}
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
        lineHeight={hasSubtitle ? 16 : 38}
        style={[styles.fullName, textStyle]}
      >
        {fullName}
      </Text>
    </Text>
  )
}

const getStylesFromProps = () => ({
  direction: {
    marginRight: 3,
  },
})

export default withStyles(getStylesFromProps)(EventSelfParty)
