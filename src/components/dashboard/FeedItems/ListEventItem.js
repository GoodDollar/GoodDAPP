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
      <Section.Stack alignItems="flex-start" style={styles.avatatBottom}>
        <Avatar.Image size={34} source={feed.data.endpoint.avatar} />
      </Section.Stack>
      <Section.Stack grow={1} style={styles.mainSection}>
        <Section.Row style={[styles.borderRow, { borderBottomColor: eventSettings.color }]}>
          <Section.Stack alignItems="flex-start">
            <Text style={styles.date}>{getFormattedDateTime(feed.date)}</Text>
          </Section.Stack>
          <Section.Stack alignItems="flex-end">
            <BigGoodDollar
              number={feed.data.amount}
              color={eventSettings.color}
              elementStyles={styles.goodDollarAmount}
            />
          </Section.Stack>
        </Section.Row>
        <Section.Row>
          <Section.Stack alignItems="flex-start" grow={1}>
            <Section.Row>
              <EventCounterParty feedItem={feed} />
            </Section.Row>
            <Section.Row>
              <Text style={styles.rowDataSubText}>{feed.data.message}</Text>
            </Section.Row>
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
    padding: normalize(4),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  avatatBottom: {
    alignSelf: 'flex-end',
  },
  mainSection: {
    marginLeft: normalize(4),
  },
  borderRow: {
    borderBottomStyle: 'solid',
    borderBottomWidth: normalize(2),
    paddingBottom: normalize(4),
    marginBottom: normalize(4),
  },
  date: {
    fontSize: normalize(10),
    color: 'rgba(75, 75, 75, 0.8)',
    marginLeft: 'auto',
    fontFamily: theme.fonts.regular,
  },
  goodDollarAmount: {
    fontSize: normalize(10),
    fontFamily: theme.fonts.bold,
  },
  rowDataSubText: {
    fontSize: normalize(10),
    color: '#A3A3A3',
    marginTop: normalize(4),
    textTransform: 'capitalize',
  },
})

export default withStyles(getStylesFromProps)(ListEvent)
