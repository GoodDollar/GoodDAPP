// @flow
import React, { PureComponent } from 'react'
import { Image, TouchableHighlight, Text, View, StyleSheet, Dimensions, Button } from 'react-native'
import { normalize } from 'react-native-elements'
import { Avatar } from './index'

// image
// title
// key
// gd
// person
// for
// message
// date
// type
// actions
// person: {
//     name: 'John Doe',
//     phone: '+972-**-***3336',
//     email: 'j****e@gmail.com',
//     location: 'New Delhi, India',
//     birth: '12/30/1980',
//     facebook: '',
//     twitter: '',
//     linkedin: '',
//     instagram: ''
//   },

export type EventHorizontalListItemProps = {
  fixedHeight?: ?boolean,
  horizontal?: ?boolean,
  item: Item,
  onPress: (key: string) => void,
  onShowUnderlay?: () => void,
  onHideUnderlay?: () => void
}

export const SCREEN_SIZE = {
  width: 200,
  height: 72
}

const { height } = Dimensions.get('window')

class EventHorizontalListItem extends PureComponent<EventHorizontalListItemProps> {
  render() {
    const { fixedHeight, horizontal, item, onShowUnderlay, onHideUnderlay, onPress } = this.props

    if (horizontal) {
      return (
        <TouchableHighlight
          onPress={() => onPress(item.key)}
          onShowUnderlay={onShowUnderlay}
          onHideUnderlay={onHideUnderlay}
          tvParallaxProperties={{
            pressMagnification: 1.1
          }}
          style={[horizontal ? styles.horizItem : styles.item, horizontal ? { height } : {}]}
        >
          <View style={styles.modal}>
            {/* {item.image && <Image source={item.image} />} */}
            {item.date && item.type === 'receive' && <Text>{item.date}</Text>}
            <View style={styles.row}>
              <Text style={styles.leftTitle}>{item.title}</Text>
              {item.gd && <Text style={styles.rightTitle}>{item.gd}</Text>}
            </View>
            {item.date && item.type !== 'receive' && <Text>{item.date}</Text>}
            <View style={styles.hrLine} />
            <View style={styles.row}>
              <Avatar size={40} />
              {item.type !== 'confirmation' && (
                <Text>
                  {['receive', 'send'].indexOf(item.type) > -1 && (
                    <Text style={styles.label}>{item.type === 'receive' ? 'From' : 'To'}:</Text>
                  )}
                  <Text style={styles.name}>{item.person}</Text>
                </Text>
              )}
            </View>
            <View style={styles.hrLine} />
            {item.message && <Text>{item.message}</Text>}
            {item.actions &&
              item.actions.map(action => (
                <Button title={action.title} color={action.color} key={action.title} onPress={action.onPress} />
              ))}
          </View>
        </TouchableHighlight>
      )
    } else {
      return (
        <TouchableHighlight
          onPress={() => onPress(item.key)}
          onShowUnderlay={onShowUnderlay}
          onHideUnderlay={onHideUnderlay}
          tvParallaxProperties={{
            pressMagnification: 1.1
          }}
          style={styles.horizItem}
        >
          <View style={[styles.row, fixedHeight && { height: SCREEN_SIZE.height }]}>
            <Avatar size={40} />
            <View>
              <View style={styles.thinRow}>
                {item.type !== 'confirmation' && (
                  <Text>
                    {['receive', 'send'].indexOf(item.type) > -1 && (
                      <Text style={styles.label}>{item.type === 'receive' ? 'From' : 'To'}:</Text>
                    )}
                    <Text style={styles.name}>{item.person}</Text>
                  </Text>
                )}
                {item.gd && <Text style={styles.rightTitle}>{item.gd}</Text>}
              </View>
              <View style={styles.thinRow}>{item.for && <Text>{item.for}</Text>}</View>
            </View>
            <Avatar size={40} />
            {/* <Text style={styles.text} numberOfLines={horizontal || fixedHeight ? 3 : undefined}>
              {item.title} - {item.text}
            </Text> */}
          </View>
        </TouchableHighlight>
      )
    }
  }
}

const styles = StyleSheet.create({
  text: {
    flex: 1
  },
  horizItem: {
    flex: 1,
    alignSelf: 'flex-start' // Necessary for touch highlight
  },
  item: {
    flex: 1,
    justifyContent: 'flex-start'
  },
  row: {
    flexDirection: 'row',
    padding: normalize(10),
    backgroundColor: 'white',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  thinRow: {
    flexDirection: 'row',
    padding: normalize(2),
    backgroundColor: 'white',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
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
  hrLine: {
    borderBottomColor: '#c9c8c9',
    borderBottomWidth: normalize(1),
    width: '100%',
    marginBottom: normalize(10),
    marginTop: normalize(10)
  },
  leftTitle: {
    fontFamily: 'Helvetica, "sans-serif"',
    fontSize: normalize(16),
    color: 'black',
    fontWeight: 'bold'
  },
  rightTitle: {
    fontFamily: 'Helvetica, "sans-serif"',
    fontSize: normalize(16),
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'right'
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
  }
})

export default EventHorizontalListItem
