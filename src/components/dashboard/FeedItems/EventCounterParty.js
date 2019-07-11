import React from 'react'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { Text } from '../../common'
import { withStyles } from '../../../lib/styles'

const EventCounterParty = ({ feedItem, styles }) => {
  const direction = feedItem.type === 'send' ? 'To' : 'From'
  const withdrawStatusText =
    feedItem.type === 'send' && feedItem.data.endpoint.withdrawStatus
      ? ` by link - ${feedItem.data.endpoint.withdrawStatus}`
      : ''

  return (
    <Text style={styles.rowDataText} numberOfLines={1} ellipsizeMode="tail">
      <Text style={styles.direction}>{direction}:</Text>
      <Text style={styles.fullName}>{` ${feedItem.data.endpoint.fullName}${withdrawStatusText}`}</Text>
    </Text>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    row: {
      alignItems: 'flex-end',
      color: theme.colors.darkGray,
      display: 'flex',
      flexDirection: 'row'
    },
    direction: {
      fontSize: normalize(10),
      fontWeight: '500'
    },
    fullName: {
      fontFamily: 'Roboto-Medium',
      fontSize: normalize(16),
      fontWeight: '500'
    }
  }
}

export default withStyles(getStylesFromProps)(EventCounterParty)
