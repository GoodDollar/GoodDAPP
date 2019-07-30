// @flow
import React from 'react'
import { View } from 'react-native'
import { Avatar } from 'react-native-paper'
import normalize from '../../../lib/utils/normalizeText'
import { BigGoodDollar, Text } from '../../common'
import { getFormattedDateTime } from '../../../lib/utils/FormatDate'
import { withStyles } from '../../../lib/styles'
import type { FeedEventProps } from './EventProps'
import EventIcon from './EventIcon'
import EventCounterParty from './EventCounterParty'
import getEventSettingsByType from './EventSettingsByType'
import EmptyEventFeed from './EmptyEventFeed'

/**
 * Render list withdraw item for feed list
 * @param {FeedEventProps} feedEvent - feed event
 * @returns {HTMLElement}
 */
const ListEvent = ({ item: feed, theme, styles }: FeedEventProps) => {
  const eventSettings = getEventSettingsByType(theme, feed.type)

  if (feed.type === 'empty') {
    return <EmptyEventFeed />
  }

  return (
    <View style={styles.innerRow}>
      <Avatar.Image size={34} style={[styles.avatarBottom]} source={feed.data.endpoint.avatar} />
      <View grow style={styles.mainContents}>
        <View style={[styles.dateAndValue, { borderBottomColor: eventSettings.color }]}>
          <Text style={styles.date}>{getFormattedDateTime(feed.date)}</Text>
          {eventSettings && eventSettings.actionSymbol && (
            <Text style={[styles.actionSymbol, { color: eventSettings.color }]}>{eventSettings.actionSymbol}</Text>
          )}
          <BigGoodDollar
            bigNumberStyles={styles.bigNumberStyles}
            bigNumberUnitStyles={styles.bigNumberUnitStyles}
            color={eventSettings.color}
            number={feed.data.amount}
          />
        </View>
        <View style={styles.transferInfo} alignItems="flex-start">
          <View style={styles.mainInfo}>
            <EventCounterParty style={styles.feedItem} feedItem={feed} />
            <Text numberOfLines={1} style={styles.message}>
              {feed.data.message}
            </Text>
          </View>
          <EventIcon type={feed.type} />
        </View>
      </View>
    </View>
  )
}

const getStylesFromProps = ({ theme }) => ({
  innerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.sizes.default,
    width: '100%',
  },
  avatarBottom: {
    marginTop: 'auto',
  },
  mainContents: {
    flexGrow: 1,
    flexShrink: 1,
    height: '100%',
    marginLeft: theme.sizes.default,
  },
  dateAndValue: {
    alignItems: 'center',
    borderBottomStyle: 'solid',
    borderBottomWidth: 2,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: theme.sizes.default,
  },
  date: {
    color: theme.colors.lighterGray,
    fontFamily: theme.fonts.regular,
    fontSize: normalize(10),
    marginTop: 2,
  },
  actionSymbol: {
    fontFamily: 'Roboto-Bold',
    fontSize: normalize(15),
    marginLeft: 'auto',
  },
  bigNumberStyles: {
    fontSize: normalize(15),
    marginRight: 4,
  },
  bigNumberUnitStyles: {
    fontSize: normalize(10),
  },
  transferInfo: {
    display: 'flex',
    flexDirection: 'row',
    flexShrink: 1,
    marginTop: 'auto',
    paddingTop: theme.sizes.defaultHalf,
  },
  mainInfo: {
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: 'flex-end',
    marginBottom: 0,
    marginRight: theme.sizes.default,
    marginTop: 0,
  },
  feedItem: {
    marginBottom: theme.sizes.defaultHalf,
  },
  message: {
    fontSize: normalize(10),
    color: theme.colors.gray80Percent,
    textTransform: 'capitalize',
    paddingBottom: theme.sizes.defaultHalf,
  },
})

export default withStyles(getStylesFromProps)(ListEvent)
