// @flow
import React from 'react'
import { View } from 'react-native'
import normalize from '../../../lib/utils/normalizeText'
import { getFormattedDateTime } from '../../../lib/utils/FormatDate'
import { withStyles } from '../../../lib/styles'
import Avatar from '../../common/view/Avatar'
import BigGoodDollar from '../../common/view/BigGoodDollar'
import CustomButton from '../../common/buttons/CustomButton'
import Text from '../../common/view/Text'
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
  const itemType = feed.displayType || feed.type
  const eventSettings = getEventSettingsByType(theme, itemType)

  if (itemType === 'empty') {
    return <EmptyEventFeed />
  }

  return (
    <View style={styles.innerRow}>
      <Avatar
        size={34}
        style={[styles.avatarBottom]}
        source={feed.data && feed.data.endpoint && feed.data.endpoint.avatar}
      />
      <View grow style={styles.mainContents}>
        <View style={[styles.dateAndValue, { borderBottomColor: eventSettings.color }]}>
          <Text style={styles.date}>{getFormattedDateTime(feed.date)}</Text>
          {!eventSettings.withoutAmount && (
            <React.Fragment>
              {eventSettings && eventSettings.actionSymbol && (
                <Text style={[styles.actionSymbol, { color: eventSettings.color }]}>{eventSettings.actionSymbol}</Text>
              )}
              <BigGoodDollar
                bigNumberStyles={styles.bigNumberStyles}
                bigNumberUnitStyles={styles.bigNumberUnitStyles}
                color={eventSettings.color}
                number={feed.data.amount}
              />
            </React.Fragment>
          )}
        </View>
        <View style={styles.transferInfo} alignItems="flex-start">
          <View style={styles.mainInfo}>
            <EventCounterParty style={styles.feedItem} feedItem={feed} />
            {feed.type === 'welcome' ? (
              <Text numberOfLines={1} style={styles.boldMessage}>
                Start claiming free G$
                <CustomButton
                  mode="text"
                  color={theme.colors.lighterGray}
                  style={styles.readMore}
                  textStyle={styles.readMoreText}
                >
                  Read more...
                </CustomButton>
              </Text>
            ) : (
              <Text numberOfLines={1} style={styles.message}>
                {feed.data.message}
              </Text>
            )}
          </View>
          <EventIcon style={[styles.typeIcon]} type={itemType} />
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
    maxHeight: '100%',
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
    flexShrink: 1,
    justifyContent: 'space-between',
    paddingBottom: theme.sizes.defaultHalf,
  },
  date: {
    color: theme.colors.lighterGray,
    fontFamily: theme.fonts.default,
    fontSize: normalize(10),
    fontWeight: '400',
    marginTop: 2,
  },
  readMoreText: {
    fontFamily: theme.fonts.default,
    fontSize: normalize(10),
    fontWeight: '400',
    letterSpacing: 0,
  },
  readMore: {
    minHeight: normalize(16),
    maxHeight: normalize(16),
    marginHorizontal: -theme.sizes.default,
  },
  actionSymbol: {
    fontFamily: theme.fonts.default,
    fontSize: normalize(15),
    fontWeight: '700',
    marginLeft: 'auto',
  },
  bigNumberStyles: {
    fontSize: normalize(15),
    marginRight: theme.sizes.defaultHalf,
  },
  bigNumberUnitStyles: {
    fontSize: normalize(10),
  },
  transferInfo: {
    display: 'flex',
    flexDirection: 'row',
    flexShrink: 1,
    marginTop: 'auto',
    paddingHorizontal: theme.sizes.defaultHalf,
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
    flexShrink: 0,
    height: 22,
    marginBottom: 0,
  },
  message: {
    color: theme.colors.gray80Percent,
    fontSize: normalize(10),
    paddingBottom: theme.sizes.defaultHalf,
    textTransform: 'capitalize',
    flexShrink: 0,
    lineHeight: normalize(10),
  },
  boldMessage: {
    color: theme.fontStyle.color,
    fontFamily: theme.fonts.default,
    fontSize: normalize(16),
    fontWeight: '500',
    lineHeight: normalize(16),
  },
  typeIcon: {
    marginTop: 'auto',
  },
})

export default withStyles(getStylesFromProps)(ListEvent)
