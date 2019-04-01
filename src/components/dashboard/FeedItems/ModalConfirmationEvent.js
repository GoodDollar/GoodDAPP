import React from 'react'
import { StyleSheet, TouchableHighlight, Button, Dimensions } from 'react-native'
import { Icon, normalize } from 'react-native-elements'
import { Avatar } from 'react-native-paper'
import { Text, View } from 'react-native-web'

const { height, width } = Dimensions.get('window')

const FeedModalItem = ({ item: feed, separators, onPress }) => {
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
        <View style={styles.row}>
          {feed.data.endpoint.title && <Text style={styles.leftTitle}>{feed.data.endpoint.title}</Text>}
        </View>
        <Text>{new Date(feed.date).toLocaleString()}</Text>
        <View style={styles.hrLine} />
        <View style={styles.row}>
          <Avatar.Image size={48} style={{ backgroundColor: 'white' }} source={feed.data.endpoint.avatar} />
          <Text style={styles.name}>{feed.data.endpoint.fullName}</Text>
        </View>
        <View style={styles.hrLine} />
        <View style={styles.rowData}>
          <Icon raised color="rgb(85, 85, 85)" size={16} name="phone" />
          <Text style={styles.rightText}>{feed.data.endpoint.phone}</Text>
        </View>
        <View style={styles.hrLine} />
        <View style={styles.rowData}>
          <Icon raised color="rgb(85, 85, 85)" size={16} name="envelope" />
          <Text style={styles.rightText}>{feed.data.endpoint.email}</Text>
        </View>
        <View style={styles.hrLine} />
        <View style={styles.rowData}>
          <Icon raised color="rgb(85, 85, 85)" size={16} name="location" />
          <Text style={styles.rightText}>{feed.data.endpoint.address}</Text>
        </View>
        <View style={styles.hrLine} />
        <View style={styles.rowData}>
          <Icon raised color="rgb(85, 85, 85)" size={16} name="cake-variant" />
          <Text style={styles.rightText}>{feed.data.endpoint.birthday}</Text>
        </View>
        <View style={styles.hrLine} />
        <View style={styles.socials}>
          <Icon
            raised
            color={feed.data.endpoint.facebook ? 'rgb(0, 0, 0)' : 'rgb(187, 187, 187)'}
            size={24}
            name="facebook-with-circle"
          />
          <Icon
            raised
            color={feed.data.endpoint.twitter ? 'rgb(0, 0, 0)' : 'rgb(187, 187, 187)'}
            size={24}
            name="twitter-with-circle"
          />
          <Icon
            raised
            color={feed.data.endpoint.linkedin ? 'rgb(0, 0, 0)' : 'rgb(187, 187, 187)'}
            size={24}
            name="linkedin-with-circle"
          />
          <Icon
            raised
            color={feed.data.endpoint.instagram ? 'rgb(0, 0, 0)' : 'rgb(187, 187, 187)'}
            size={24}
            name="instagram-with-circle"
          />
        </View>
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

export default FeedModalItem
