import React from 'react'
import normalize from '../../../lib/utils/normalizeText'
import { Text } from '../../common'
import { withStyles } from '../../../lib/styles'

const EventCounterParty = ({ feedItem, styles, style }) => {
  const direction = feedItem.type === 'send' ? 'To' : 'From'

  return (
    <Text style={[styles.rowDataText, style]} numberOfLines={1} ellipsizeMode="tail">
      <Text style={styles.direction}>{direction}:</Text>
      <Text style={styles.fullName}>{feedItem.data.endpoint.fullName}</Text>
    </Text>
  )
}

const getStylesFromProps = ({ theme }) => ({
  rowDataText: {
    color: theme.fontStyle.color,
    lineHeight: normalize(16),
    textAlign: 'left',
    textTransform: 'capitalize',
    marginBottom: theme.sizes.defaultHalf,
  },
  direction: {
    fontSize: normalize(10),
  },
  fullName: {
    fontFamily: theme.fonts.default,
    fontSize: normalize(16),
    fontWeight: '500',
    lineHeight: normalize(16),
  },
})

export default withStyles(getStylesFromProps)(EventCounterParty)
