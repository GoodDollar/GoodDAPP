import React from 'react'
import { StyleSheet, Button } from 'react-native'
import { normalize } from 'react-native-elements'
import { Avatar } from 'react-native-paper'
import { Text, View } from 'react-native-web'
import BigGoodDollar from '../../common/BigGoodDollar'

const ModalSendEvent = ({ item: feed }) => {
  return (
    <View style={styles.modal}>
      <View style={styles.row}>
        {feed.data.endpoint.title && <Text style={styles.leftTitle}>{feed.data.endpoint.title}</Text>}
        <Text style={styles.leftTitle}>Sent GD</Text>
        <BigGoodDollar number={feed.data.amount} elementStyles={styles.currency} />
      </View>
      <Text>{new Date(feed.date).toLocaleString()}</Text>
      <View style={styles.hrLine} />
      <View style={styles.row}>
        <Avatar.Image size={48} style={{ backgroundColor: 'white' }} source={feed.data.endpoint.avatar} />
        <Text style={styles.leftMargin}>
          <Text style={styles.label}>To:</Text>
          <Text style={styles.name}>{feed.data.endpoint.fullName}</Text>
        </Text>
      </View>
      <View style={styles.hrLine} />
      {feed.data.message && <Text>{feed.data.message}</Text>}
      {feed.actions &&
        feed.actions.map(action => (
          <Button title={action.title} color={action.color} key={action.title} onPress={action.onPress} />
        ))}
    </View>
  )
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: normalize(4),
    borderLeftWidth: normalize(10),
    borderRightWidth: normalize(2),
    borderTopWidth: normalize(2),
    borderBottomWidth: normalize(2),
    padding: normalize(30),
    borderColor: '#c9c8c9'
  },
  leftMargin: {
    marginLeft: 'auto'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    justifyContent: 'flex-end',
    padding: 0
  },
  leftTitle: {
    fontFamily: 'Helvetica, "sans-serif"',
    fontSize: normalize(16),
    color: 'black',
    fontWeight: 'bold',
    flex: 1
  },
  rightTitle: {
    fontFamily: 'Helvetica, "sans-serif"',
    fontSize: normalize(16),
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'right'
  },
  hrLine: {
    borderBottomColor: '#c9c8c9',
    borderBottomWidth: normalize(1),
    width: '100%',
    marginBottom: normalize(10),
    marginTop: normalize(10)
  },
  label: {
    fontFamily: 'Helvetica, "sans-serif"',
    fontSize: normalize(10),
    color: 'black',
    display: 'inlineBlock'
  },
  name: {
    fontFamily: 'Helvetica, "sans-serif"',
    fontSize: normalize(14),
    color: 'black',
    display: 'inlineBlock'
  },
  currency: {
    fontFamily: 'Helvetica, "sans-serif"',
    fontSize: normalize(16),
    color: 'black',
    fontWeight: 'bold'
  }
})

export default ModalSendEvent
