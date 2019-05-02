// @flow
import React from 'react'
import { Icon } from 'react-native-elements'
import { Avatar } from 'react-native-paper'
import { Text, View } from 'react-native-web'
import BigGoodDollar from '../../common/BigGoodDollar'
import { listStyles } from './EventStyles'
import type { FeedEventProps } from './EventProps'

/**
 * Render list claim item for feed list
 * @param {FeedEventProps} feedEvent - feed event
 * @returns {HTMLElement}
 */
const ListClaimEvent = ({ item: feed }: FeedEventProps) => {
  return (
    <View style={listStyles.innerRow}>
      <View>
        <Avatar.Image size={48} style={{ backgroundColor: 'white' }} source={feed.data.endpoint.avatar} />
        <Text>{`\n`}</Text>
      </View>
      <View style={listStyles.rowData}>
        <Text style={listStyles.rowDataText}>Claimed</Text>
      </View>
      <View style={[listStyles.row, { borderBottomWidth: 0, marginBottom: 0, padding: 0 }]}>
        <BigGoodDollar number={feed.data.amount} elementStyles={listStyles.currency} />
        <View style={listStyles.rowData}>
          <Icon raised color="rgb(85, 85, 85)" size={24} name="call-received" />
          <Text style={{ fontSize: '8px', color: '#4b4b4b', opacity: 0.8 }}>
            {new Date(feed.date).toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default ListClaimEvent
