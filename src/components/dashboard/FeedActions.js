// @flow
import React from 'react'
import { Alert, TouchableHighlight, View } from 'react-native-web'
import { withStyles } from '../../lib/styles'
import { Icon, Text } from '../common'
import normalize from '../../lib/utils/normalizeText'
import type { FeedEventProps } from './FeedItems/EventProps'

/**
 * Returns swipeable actions for items inside Feed list
 *
 * @param {FeedEventProps} feedItem - Contains the feed item
 * @returns React element with actions
 */
const FeedActions = ({ item, styles, theme }: FeedEventProps) => (
  <View
    style={[
      styles.actionsContainer,
      {
        backgroundColor: item && item.type !== 'empty' ? theme.colors.red : theme.colors.surface,
      },
    ]}
  >
    {item && item.type !== 'empty' && (
      <TouchableHighlight
        onPress={() => {
          Alert.alert('Tips', 'You could do something with this remove action!')
        }}
      >
        <View style={styles.actionsContainerInner}>
          <Icon name="close" color={theme.colors.surface} />
          <Text style={[styles.action]}>Delete</Text>
        </View>
      </TouchableHighlight>
    )}
  </View>
)

const getStylesFromProps = ({ theme }) => ({
  actionsContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    borderBottomRightRadius: theme.feedItems.borderRadius,
    borderTopRightRadius: theme.feedItems.borderRadius,
    height: theme.feedItems.height,
    marginTop: theme.sizes.default,
    marginRight: theme.sizes.default,
    maxHeight: theme.feedItems.height,
    padding: theme.sizes.default,
    width: 122,
  },
  actionsContainerInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  action: {
    color: '#fff',
    fontFamily: theme.fonts.roboto,
    fontSize: normalize(14),
    fontWeight: '500',
    lineHeight: normalize(14),
    marginTop: theme.sizes.default,
  },
})

export default withStyles(getStylesFromProps)(FeedActions)
