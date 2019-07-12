// @flow
import React from 'react'
import { StyleSheet } from 'react-native'
import { Alert, Text, TouchableHighlight, View } from 'react-native-web'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { Icon, Section } from '../common'
import type { FeedEventProps } from './FeedItems/EventProps'

/**
 * Returns swipeable actions for items inside Feed list
 *
 * @param {FeedEventProps} feedItem - Contains the feed item
 * @returns React element with actions
 */
export default ({ item }: FeedEventProps) => (
  <View style={item && item.type !== 'empty' ? styles.actionsContainer : styles.emptyActionsContainer}>
    {item && item.type !== 'empty' && (
      <TouchableHighlight
        onPress={() => {
          Alert.alert('Tips', 'You could do something with this remove action!')
        }}
      >
        <View>
          <Section.Row justifyContent="center">
            <Icon name="close" color="#fff" />
          </Section.Row>
          <Section.Row justifyContent="center">
            <Text style={styles.actionButtonText}>Delete</Text>
          </Section.Row>
        </View>
      </TouchableHighlight>
    )}
  </View>
)

const styles = StyleSheet.create({
  actionsContainer: {
    alignItems: 'center',
    backgroundColor: '#fa6c77',
    borderRadius: normalize(8),
    flex: 1,
    flexDirection: 'row',
    height: normalize(80),
    justifyContent: 'flex-end',
    maxHeight: normalize(80),
    padding: normalize(8)
  },
  emptyActionsContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: normalize(8),
    flex: 1,
    flexDirection: 'row',
    height: normalize(80),
    justifyContent: 'flex-end',
    maxHeight: normalize(80),
    padding: normalize(8)
  },
  actionButtonText: {
    color: '#fff',
    textAlign: 'center'
  }
})
