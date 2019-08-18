// @flow
import React from 'react'
import { TouchableOpacity, View } from 'react-native-web'
import { ActivityIndicator } from 'react-native-paper'
import { withStyles } from '../../lib/styles'
import { Icon, Text } from '../common'
import type { FeedEventProps } from './FeedItems/EventProps'

/**
 * Returns swipeable actions for items inside Feed list
 *
 * @param {FeedEventProps} feedItem - Contains the feed item
 * @returns React element with actions
 */
const FeedActions = ({ actionActive, hasAction, children, onPress, styles, theme }: FeedEventProps) => {
  const backgroundColor = hasAction ? theme.colors.red : 'transparent'

  const content =
    actionActive === undefined ? (
      <>
        <Icon name="close" color={theme.colors.surface} />
        <Text style={styles.action} fontSize={14} fontWeight="medium" color="surface">
          {children}
        </Text>
      </>
    ) : (
      <ActivityIndicator />
    )
  return (
    <View style={[styles.actionsContainer, { backgroundColor }]}>
      {hasAction && (
        <TouchableOpacity onPress={actionActive === undefined && onPress}>
          <View style={styles.actionsContainerInner}>{content}</View>
        </TouchableOpacity>
      )}
    </View>
  )
}

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
    marginTop: theme.sizes.default,
    paddingHorizontal: theme.sizes.default,
  },
})

export default withStyles(getStylesFromProps)(FeedActions)
