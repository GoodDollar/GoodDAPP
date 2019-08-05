// @flow
import React from 'react'
import { Alert, TouchableOpacity, View } from 'react-native-web'
import { withStyles } from '../../lib/styles'
import { Icon, Text } from '../common'
import type { FeedEventProps } from './FeedItems/EventProps'

/**
 * Returns swipeable actions for items inside Feed list
 *
 * @param {FeedEventProps} feedItem - Contains the feed item
 * @returns React element with actions
 */
const FeedActions = ({ item, styles, theme }: FeedEventProps) => {
  const canDelete = item && item.id && item.id.indexOf('0x') === -1
  const canCancel = item && item.displayType === 'sendpending'
  const hasAction = canDelete || canCancel
  const backgroundColor = hasAction ? theme.colors.red : 'transparent'

  const handleActionPress = () => {
    Alert.alert('Tips', 'You could do something with this remove action!')
  }

  return (
    <View style={[styles.actionsContainer, { backgroundColor }]}>
      {hasAction && (
        <TouchableOpacity onPress={handleActionPress}>
          <View style={styles.actionsContainerInner}>
            <Icon name="close" color={theme.colors.surface} />
            <Text style={[styles.action]} fontSize={14} fontWeight="500" color="surface">
              {actionLabel({ canDelete, canCancel })}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  )
}

const actionLabel = ({ canDelete, canCancel }) => {
  if (canDelete) {
    return 'Delete'
  }

  if (canCancel) {
    return 'Cancel Payment Link'
  }

  return ''
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
