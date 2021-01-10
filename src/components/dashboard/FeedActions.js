// @flow
import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { withStyles } from '../../lib/styles'
import { Icon, Text } from '../common'
import useOnPress from '../../lib/hooks/useOnPress'
import type { FeedEventProps } from './FeedItems/EventProps'

/**
 * Returns swipeable actions for items inside Feed list
 *
 * @param {FeedEventProps} feedItem - Contains the feed item
 * @returns React element with actions
 */
const FeedActions = ({ hasAction, children, actionIcon, onPress, styles, theme }: FeedEventProps) => {
  const backgroundColor = hasAction ? theme.colors.red : 'transparent'
  const _onPress = useOnPress(onPress)

  return (
    <View style={[styles.actionsContainer, { backgroundColor }]}>
      {hasAction && (
        <TouchableOpacity onPress={_onPress}>
          <View style={styles.actionsContainerInner}>
            <Icon name={actionIcon} color={theme.colors.surface} size={22} />
            <Text style={styles.action} fontSize={14} fontWeight="medium" color="surface">
              {children}
            </Text>
          </View>
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

    // height: theme.feedItems.height,
    marginTop: theme.sizes.default,
    paddingRight: 0,
    paddingLeft: 24,
    marginRight: theme.sizes.default,
    maxHeight: theme.feedItems.height,
    flex: 1,
    height: '100%',
    padding: theme.sizes.default,
    width: 140,
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
