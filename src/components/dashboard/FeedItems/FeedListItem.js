// @flow
import React, { useCallback } from 'react'
import { Platform, TouchableHighlight, View } from 'react-native'
import * as Animatable from 'react-native-animatable'

import type { FeedEvent } from '../../../lib/userStorage/UserStorageClass'
import { withStyles } from '../../../lib/styles'
import useNavigationMacro from '../../../lib/hooks/useNavigationMacro'
import wavePattern from '../../../assets/feedListItemPattern.svg'
import SimpleStore from '../../../lib/undux/SimpleStore'
import { CARD_OPEN, fireEvent } from '../../../lib/analytics/analytics'
import useOnPress from '../../../lib/hooks/useOnPress'
import { useNativeDriverForAnimation } from '../../../lib/utils/platform'
import Config from '../../../config/config'
import ListEventItem from './ListEventItem'
import getEventSettingsByType from './EventSettingsByType'

type FeedListItemProps = {
  item: FeedEvent,
  onPress: Function,
  index: number,
  theme?: any,
  styles?: any,
}

/**
 * Render list item according to the type for feed list
 * @param {FeedListItemProps} props
 * @param {FeedEvent} props.item - feed event
 * @param {function} props.onPress
 * @param {number} index
 * @param {object} props.theme
 * @param {object} props.styles
 * @returns {React.Node}
 */
const FeedListItem = React.memo((props: FeedListItemProps) => {
  const disableAnimForTests = Config.env === 'test'
  const simpleStore = SimpleStore.useStore()
  const { theme, item, handleFeedSelection, styles } = props
  const { id, type, displayType, action } = item

  const itemType = displayType || type
  const isItemEmpty = itemType === 'empty'
  const itemStyle = getEventSettingsByType(theme, itemType)
  const easing = 'ease-in'

  const imageStyle = {
    backgroundColor: itemStyle.color,
    backgroundImage: `url(${wavePattern})`,
  }

  const onItemPress = useNavigationMacro(
    action,
    useCallback(() => handleFeedSelection(item, true), [handleFeedSelection]),
  )

  const onPress = useOnPress(() => {
    if (type !== 'empty') {
      fireEvent(CARD_OPEN, { cardId: id })
      onItemPress()
    }
  }, [fireEvent, type, onItemPress, id])

  if (isItemEmpty) {
    const feedLoadAnimShown = simpleStore.get('feedLoadAnimShown')
    const showLoadAnim = !feedLoadAnimShown && !disableAnimForTests
    const duration = 1250
    const animScheme = {
      from: {
        opacity: 0,
        transform: [
          {
            translateY: 250,
          },
        ],
      },
      to: {
        opacity: 1,
        transform: [
          {
            translateY: 0,
          },
        ],
      },
    }

    return (
      <>
        <Animatable.View
          animation={showLoadAnim ? animScheme : ''}
          duration={duration}
          easing={easing}
          useNativeDriver={useNativeDriverForAnimation}
        >
          <View style={styles.row}>
            <View style={styles.rowContent}>
              <View style={[styles.rowContentBorder, imageStyle]} />
              <ListEventItem {...props} />
            </View>
          </View>
        </Animatable.View>
        <Animatable.View
          animation={showLoadAnim ? animScheme : ''}
          duration={duration}
          delay={200}
          easing={easing}
          useNativeDriver={useNativeDriverForAnimation}
        >
          <View style={styles.row}>
            <View style={styles.rowContent}>
              <View style={[styles.rowContentBorder, imageStyle]} />
              <ListEventItem {...props} />
            </View>
          </View>
        </Animatable.View>
        <Animatable.View
          animation={showLoadAnim ? animScheme : ''}
          duration={duration}
          delay={550}
          easing={easing}
          useNativeDriver={useNativeDriverForAnimation}
        >
          <View style={styles.row}>
            <View style={styles.rowContent}>
              <View style={[styles.rowContentBorder, imageStyle]} />
              <ListEventItem {...props} />
            </View>
          </View>
        </Animatable.View>
      </>
    )
  }

  return (
    <TouchableHighlight
      activeOpacity={0.5}
      onPress={onPress}
      style={[styles.row, styles.rowHasBeenAnimated]}
      tvParallaxProperties={{ pressMagnification: 1.1 }}
      underlayColor={theme.colors.lightGray}
    >
      <ListEventItem {...props} />
    </TouchableHighlight>
  )
})

const getStylesFromProps = ({ theme }) => ({
  row: {
    borderRadius: theme.feedItems.borderRadius,
    flexDirection: 'row',
    marginTop: theme.sizes.default,
    shadowColor: theme.colors.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    // height: theme.feedItems.height,
    marginHorizontal: theme.sizes.default,
    maxHeight: theme.feedItems.height,
    shadowOpacity: 0.16,
    shadowRadius: 4,
  },
  rowHasBeenAnimated: Platform.select({
    android: { elevation: 1 },
    default: {},
  }),
  rowContent: {
    borderRadius: theme.feedItems.borderRadius,
    overflow: 'hidden',
    alignItems: 'center',
    backgroundColor: theme.feedItems.itemBackgroundColor,
    flex: 1,
    justifyContent: 'center',
    paddingLeft: theme.paddings.mainContainerPadding,
  },
  rowContentBorder: {
    height: '100%',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: 10,
  },
})

export default withStyles(getStylesFromProps)(FeedListItem)
