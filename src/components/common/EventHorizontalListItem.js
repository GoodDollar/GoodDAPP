// @flow
import React, { PureComponent } from 'react'
import { Image, TouchableHighlight, Text, View, StyleSheet } from 'react-native'
import { normalize } from 'react-native-elements'
import { Avatar } from './index'

export type EventHorizontalListItemProps = {
  fixedHeight?: ?boolean,
  horizontal?: ?boolean,
  item: Item,
  onPress: (key: string) => void,
  onShowUnderlay?: () => void,
  onHideUnderlay?: () => void
}

class EventHorizontalListItem extends PureComponent<EventHorizontalListItemProps> {
  render() {
    const { fixedHeight, horizontal, item, onShowUnderlay, onHideUnderlay, onPress } = this.props
    const imgSource = ''

    if (horizontal) {
      return (
        <TouchableHighlight
          onPress={() => onPress(item.key)}
          onShowUnderlay={onShowUnderlay}
          onHideUnderlay={onHideUnderlay}
          tvParallaxProperties={{
            pressMagnification: 1.1
          }}
          style={horizontal ? styles.horizItem : styles.item}
        >
          <View style={styles.modal}>
            <Text style={styles.title}>{item.title}</Text>
            <View style={styles.hrLine} />
            <View style={styles.profileRow}>
              <Avatar size={40} />
              <Text style={styles.label}>To:</Text>
              <Text style={styles.name}>{item.addressee}</Text>
            </View>
            <View style={styles.hrLine} />
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
          style={horizontal ? styles.horizItem : styles.item}
        >
          <View style={[styles.row, horizontal && { width: 200 }, fixedHeight && { height: 72 }]}>
            {!item.noImage && <Image style={styles.thumb} source={imgSource} />}
            <Text style={styles.text} numberOfLines={horizontal || fixedHeight ? 3 : undefined}>
              {item.title} - {item.text}
            </Text>
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
    alignSelf: 'flex-start' // Necessary for touch highlight
  },
  item: {
    flex: 1
  },
  row: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white'
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
  title: {
    fontFamily: 'Helvetica, "sans-serif"',
    fontSize: normalize(16),
    color: 'black',
    fontWeight: 'bold'
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
  profileRow: {
    alignItems: 'stretch'
  }
})

export default EventHorizontalListItem
