// @flow
import React from 'react'
import { TouchableOpacity, View } from 'react-native-web'
import { withStyles } from '../../lib/styles'
import goodWallet from '../../lib/wallet/GoodWallet'
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

  const handleActionPress = async () => {
    if (canCancel) {
      try {
        await goodWallet.cancelOTLByTransactionHash(item.id)
      } catch (e) {
        console.info('error', e)
      }
    }

    // TODO: canDelete action
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
  if (canCancel) {
    return 'Cancel Payment Link'
  }

  if (canDelete) {
    return 'Delete'
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
