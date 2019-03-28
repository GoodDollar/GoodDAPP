import React from 'react'
import { StyleSheet } from 'react-native'
import { Icon, normalize } from 'react-native-elements'
import { Avatar } from 'react-native-paper'
import { Text, View } from 'react-native-web'
import BigGoodDollar from '../common/BigGoodDollar'

const iconType = type => {
  const icons = ['call-made', 'call-received', 'priority-high', 'message']
  return (
    {
      withdraw: 'call-received',
      send: 'call-made'
    }[type] || icons[Math.floor(Math.random() * icons.length)]
  )
}

const messageTitle = type =>
  ({
    withdraw: 'From:',
    send: 'To:'
  }[type] || '')

const FeedItem = ({ item: feed }) => {
  return (
    <View style={styles.row}>
      <View>
        <Avatar.Image size={48} style={{ backgroundColor: 'white' }} source={feed.data.endpoint.avatar} />
        <Text>{`\n`}</Text>
      </View>
      <View style={styles.rowData}>
        <Text style={styles.rowDataText}>{`${messageTitle(feed.type)} ${feed.data.endpoint.fullName}`}</Text>
        <Text style={styles.rowDataSubText}>{feed.data.message}</Text>
      </View>
      <View style={[styles.row, { border: 'none', marginBottom: 0, padding: 0, alignItems: 'right' }]}>
        <BigGoodDollar number={feed.data.amount} elementStyles={styles.currency} />
        <View style={styles.rowData}>
          <Icon raised color="rgb(85, 85, 85)" size={24} name={iconType(feed.type)} />
          <Text style={{ fontSize: '8px', color: '#4b4b4b', opacity: '0.8' }}>
            {new Date(feed.date).toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    marginBottom: 5,
    backgroundColor: 'rgb(238, 238, 239)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)'
  },
  rowIcon: {
    width: 64,
    height: 64,
    marginRight: 20,
    borderRadius: '50%',
    boxShadow: '0 1px 2px 0 rgba(0,0,0,0.1)'
  },
  rowData: {
    flex: 1
  },
  rowDataText: {
    fontSize: 15,
    textTransform: 'capitalize',
    color: '#4b4b4b'
  },
  rowDataSubText: {
    fontSize: 13,
    opacity: 0.8,
    color: '#a8a689',
    marginTop: 4
  },
  currency: {
    fontSize: normalize(12)
  }
})

export default FeedItem
