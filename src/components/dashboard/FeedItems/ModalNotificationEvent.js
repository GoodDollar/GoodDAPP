import React from 'react'
import { StyleSheet, Button, Image } from 'react-native'
import { normalize } from 'react-native-elements'
import { Text, View } from 'react-native-web'

const ModalNotificationEvent = ({ item: feed }) => {
  return (
    <View style={styles.modal}>
      {feed.data.endpoint.image && <Image source={feed.data.endpoint.image} />}
      <View style={styles.row}>
        {feed.data.endpoint.title && <Text style={styles.leftTitle}>{feed.data.endpoint.title}</Text>}
      </View>
      <Text>{new Date(feed.date).toLocaleString()}</Text>
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
  hrLine: {
    borderBottomColor: '#c9c8c9',
    borderBottomWidth: normalize(1),
    width: '100%',
    marginBottom: normalize(10),
    marginTop: normalize(10)
  }
})

export default ModalNotificationEvent
