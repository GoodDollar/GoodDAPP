// @flow
import React from 'react'
import { Avatar } from 'react-native-paper'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { BigGoodDollar, Section, Text } from '../../common'
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
    <Section.Row style={styles.innerRow}>
      <Section.Stack alignItems="flex-start" style={styles.avatarBottom}>
        <Avatar.Image size={34} source={feed.data.endpoint.avatar} />
      </Section.Stack>
      <Section.Stack grow style={styles.mainSection}>
        <Section.Row style={[styles.borderRow, { borderBottomColor: eventSettings.color }]}>
          <Text style={styles.date}>{getFormattedDateTime(feed.date)}</Text>
          <BigGoodDollar
            color={eventSettings.color}
            bigNumberStyles={styles.bigNumberStyles}
            bigNumberUnitStyles={styles.bigNumberUnitStyles}
            number={feed.data.amount}
          />
        </Section.Row>
        <Section.Row style={styles.bottomInfo} alignItems="flex-start">
          <Section.Stack style={styles.mainInfo}>
            <EventCounterParty style={styles.feedItem} feedItem={feed} />
            <Text numberOfLines={1} style={styles.message}>
              {feed.data.message}
            </Text>
          </Section.Stack>
          <Section.Stack alignItems="flex-end">
            <EventIcon type={feed.type} />
          </Section.Stack>
        </Section.Row>
      </Section.Stack>
    </Section.Row>
  )
}

// <Section.Row>
//   <Section.Stack alignItems="flex-start" grow>
//     <Section.Row>
//       <EventCounterParty feedItem={feed} />
//     </Section.Row>
//     <Section.Row>
//       <Text style={styles.rowDataSubText}>{feed.data.message}</Text>
//     </Section.Row>

const getStylesFromProps = ({ theme }) => ({
  innerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: normalize(8),
    width: '100%',
    flex: 1,
  },
  avatarBottom: {
    alignSelf: 'flex-end',
  },
  mainSection: {
    marginLeft: normalize(8),
  },
  borderRow: {
    alignItems: 'center',
    borderBottomStyle: 'solid',
    borderBottomWidth: normalize(2),
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: normalize(8),
    paddingBottom: normalize(4),
  },
  date: {
    color: theme.colors.lighterGray,
    fontFamily: theme.fonts.regular,
    fontSize: normalize(10),
    marginTop: normalize(2),
  },
  bigNumberStyles: {
    fontSize: normalize(15),
  },
  bigNumberUnitStyles: {
    fontSize: normalize(10),
  },
  bottomInfo: {
    flexShrink: 1,
  },
  mainInfo: {
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: 'flex-end',
    marginVertical: 'auto',
  },
  feedItem: {
    marginTop: 'auto',
    paddingRight: normalize(4),
  },
  message: {
    fontSize: normalize(10),
    color: theme.colors.gray80Percent,
    textTransform: 'capitalize',
  },
})

export default withStyles(getStylesFromProps)(ListEvent)
