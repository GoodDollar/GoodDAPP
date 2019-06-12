// @flow
import React from 'react'
import { StyleSheet } from 'react-native'
import { Alert, Text, TouchableHighlight, View } from 'react-native-web'
import goodWallet from '../../lib/wallet/GoodWallet'
import type { FeedEventProps } from './FeedItems/EventProps'

/**
 * Returns swipeable actions for items inside Feed list
 *
 * @param {FeedEventProps} feedItem - Contains the feed item
 * @returns React element with actions
 */
export default ({ item }: FeedEventProps) => (
  <View style={styles.actionsContainer}>
    {item && !goodWallet.wallet.utils.isHexStrict(item.id) && (
      <TouchableHighlight
        style={[styles.actionButton, styles.actionButtonDestructive]}
        onPress={() => {
          Alert.alert('Tips', 'You could do something with this remove action!')
        }}
      >
        <Text style={styles.actionButtonText}>Delete</Text>
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
    padding: 10
  },
  actionButton: {
    padding: 10,
    borderRadius: 6,
    width: 80,
    backgroundColor: '#808080',
    marginRight: 5,
    marginLeft: 5
  },
  actionButtonDestructive: {
    backgroundColor: '#ff4b21'
  },
  actionButtonText: {
    color: 'white',
    textAlign: 'center'
  }
})
