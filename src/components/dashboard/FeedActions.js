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
  <View style={styles.actionsContainer}>
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
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: normalize(8),
    backgroundColor: '#fa6c77',
    borderRadius: normalize(8),
    height: normalize(84),
    maxHeight: normalize(84)
  },
  actionButtonText: {
    color: 'white',
    textAlign: 'center'
  }
})
