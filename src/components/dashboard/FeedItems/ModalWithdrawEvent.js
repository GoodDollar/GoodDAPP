import React from 'react'
import { StyleSheet, TouchableHighlight, Button, Dimensions } from 'react-native'
import { normalize } from 'react-native-elements'
import { Avatar } from 'react-native-paper'
import { Text, View } from 'react-native-web'
import BigGoodDollar from '../../common/BigGoodDollar'

const { height, width } = Dimensions.get('window')

const ModalWithdrawEvent = ({ item: feed, separators, onPress }) => {
  return (
    <TouchableHighlight
      onPress={() => onPress(feed.id)}
      onShowUnderlay={separators.highlight}
      onHideUnderlay={separators.unhighlight}
      tvParallaxProperties={{
        pressMagnification: 1.1
      }}
      style={[
        styles.horizItem,
        { height: height - normalize(80), width: width - normalize(40), marginLeft: normalize(10) }
      ]}
    >
      <View style={styles.modal}>
        <Text>{new Date(feed.date).toLocaleString()}</Text>
        <View style={styles.row}>
          {feed.data.endpoint.title && <Text style={styles.leftTitle}>{feed.data.endpoint.title}</Text>}
          <Text style={styles.leftTitle}>Received GD</Text>
          <BigGoodDollar number={feed.data.amount} elementStyles={styles.currency} />
        </View>
        <View style={styles.hrLine} />
        <View style={styles.row}>
          <Avatar.Image size={48} style={{ backgroundColor: 'white' }} source={feed.data.endpoint.avatar} />
          <Text style={styles.leftMargin}>
            <Text style={styles.label}>From:</Text>
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
    </TouchableHighlight>
  )
}

const styles = StyleSheet.create({
  horizItem: {
    flex: 1,
    alignSelf: 'flex-start' // Necessary for touch highlight
  },
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
  leftMargin: {
    marginLeft: 'auto'
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

export default ModalWithdrawEvent
