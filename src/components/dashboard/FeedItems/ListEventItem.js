// @flow
import React from 'react'
import { Avatar } from 'react-native-paper'
import { Text, View } from 'react-native-web'
import BigGoodDollar from '../../common/BigGoodDollar'
import { getFormattedDateTime } from '../../../lib/utils/FormatDate'
import { listStyles } from './EventStyles'
import type { FeedEventProps } from './EventProps'
import EventIcon from './EventIcon'
import EventCounterParty from './EventCounterParty'

/**
 * Render list withdraw item for feed list
 * @param {FeedEventProps} feedEvent - feed event
 * @returns {HTMLElement}
 */
const ListEvent = ({ item: feed }: FeedEventProps) => {
  return (
    <View style={listStyles.innerRow}>
      <View>
        <Avatar.Image size={36} style={{ backgroundColor: 'white' }} source={feed.data.endpoint.avatar} />
        <Text>{`\n`}</Text>
      </View>
      <View style={listStyles.rowData}>
        <EventCounterParty feedItem={feed} />
        <Text style={listStyles.rowDataSubText}>{feed.data.message}</Text>
      </View>
      <View style={listStyles.contentColumn}>
        <View style={listStyles.rightContentRow}>
          <BigGoodDollar number={feed.data.amount} elementStyles={listStyles.currency} />
          <EventIcon type={feed.type} />
          <Text style={listStyles.rowDataSubText}>status: {feed.status}</Text>
        </View>
        <View style={listStyles.rightContentRow}>
          <Text style={listStyles.date}>{getFormattedDateTime(feed.date)}</Text>
        </View>
      </View>
    </View>
  )
}

export default ListEvent
