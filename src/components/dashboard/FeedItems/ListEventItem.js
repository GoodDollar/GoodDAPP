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
      <Section.Stack grow={1} style={styles.mainSection}>
        <Section.Row style={[styles.borderRow, { borderBottomColor: eventSettings.color }]}>
          <Text style={styles.date}>{getFormattedDateTime(feed.date)}</Text>
          <BigGoodDollar
            color={eventSettings.color}
            bigNumberStyles={styles.bigNumberStyles}
            bigNumberUnitStyles={styles.bigNumberUnitStyles}
            number={feed.data.amount}
          />
        </Section.Row>
        <Section.Row style={styles.bottomInfo}>
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

const getStylesFromProps = ({ theme }) => ({
  innerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: normalize(8),
    width: '100%',
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
    paddingBottom: normalize(5),
  },
  date: {
    color: theme.colors.lighterGray,
    fontFamily: theme.fonts.regular,
    fontSize: normalize(10),
    marginTop: normalize(2),
  },
  bigNumberStyles: {
    fontSize: normalize(15),
    fontFamily: theme.fonts.bold,
  },
  bigNumberUnitStyles: {
    fontSize: normalize(10),
    fontFamily: theme.fonts.bold,
  },
  bottomInfo: {
    alignItems: 'flex-start',
    flexShrink: 1,
  },
  mainInfo: {
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: 'flex-end',
    marginTop: 'auto',
  },
  feedItem: {
    marginTop: 'auto',
    paddingRight: normalize(4),
  },
  message: {
    color: theme.colors.lighterGray,
    fontSize: normalize(10),
    marginTop: normalize(5),
    paddingRight: normalize(5),
    textAlign: 'left',
    textTransform: 'capitalize',
  },
})

export default withStyles(getStylesFromProps)(ListEvent)
