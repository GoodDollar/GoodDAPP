// @flow
import React from 'react'
import { Avatar, withTheme } from 'react-native-paper'
import { Text } from 'react-native-web'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { BigGoodDollar, Section } from '../../common/'
import { getFormattedDateTime } from '../../../lib/utils/FormatDate'
import { listStyles } from './EventStyles'
import type { FeedEventProps } from './EventProps'
import EventIcon from './EventIcon'
import EventCounterParty from './EventCounterParty'
import getEventSettingsByType from './EventSettingsByType'
import EmptyEventFeed from './EmptyEventFeed'

const getEventItemStyles = color => ({
  borderRow: {
    borderBottomColor: color,
    borderBottomStyle: 'solid',
    borderBottomWidth: normalize(2),
    paddingBottom: normalize(4),
    marginBottom: normalize(4)
  },
  goodDollarAmount: {
    fontSize: normalize(10),
    fontFamily: 'Roboto-Bold',
    color
  }
})

/**
 * Render list withdraw item for feed list
 * @param {FeedEventProps} feedEvent - feed event
 * @returns {HTMLElement}
 */
const ListEvent = ({ item: feed, theme }: FeedEventProps) => {
  const eventSettings = getEventSettingsByType(theme, feed.type)
  const styles = getEventItemStyles(eventSettings.color)

  if (feed.type === 'empty') {
    return <EmptyEventFeed />
  }
  return (
    <Section.Row style={listStyles.innerRow}>
      <Section.Stack alignItems="flex-start" style={listStyles.avatatBottom}>
        <Avatar.Image size={34} source={feed.data.endpoint.avatar} />
      </Section.Stack>
      <Section.Stack grow={1} style={listStyles.mainSection}>
        <Section.Row style={styles.borderRow}>
          <Section.Stack alignItems="flex-start">
            <Text style={listStyles.date}>{getFormattedDateTime(feed.date)}</Text>
          </Section.Stack>
          <Section.Stack alignItems="flex-end">
            <BigGoodDollar number={feed.data.amount} elementStyles={styles.goodDollarAmount} />
          </Section.Stack>
        </Section.Row>
        <Section.Row>
          <Section.Stack alignItems="flex-start" grow={1}>
            <Section.Row>
              <EventCounterParty feedItem={feed} />
            </Section.Row>
            <Section.Row>
              <Text style={listStyles.rowDataSubText}>{feed.data.message}</Text>
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

export default withTheme(ListEvent)
