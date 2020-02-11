// @flow
import React from 'react'
import { TouchableHighlight, View } from 'react-native'
import * as Animatable from 'react-native-animatable'
import type { FeedEvent } from '../../../lib/gundb/UserStorageClass'
import { withStyles } from '../../../lib/styles'
import wavePattern from '../../../assets/feedListItemPattern.svg'
import SimpleStore from '../../../lib/undux/SimpleStore'
import Config from '../../../config/config'
import ListEventItem from './ListEventItem'
import getEventSettingsByType from './EventSettingsByType'

type FeedListItemProps = {
  item: FeedEvent,
  onPress: Function,
  theme?: any,
  styles?: any,
}

/**
 * Render list item according to the type for feed list
 * @param {FeedListItemProps} props
 * @param {FeedEvent} props.item - feed event
 * @param {function} props.onPress
 * @param {object} props.theme
 * @param {object} props.styles
 * @returns {React.Node}
 */
const FeedListItem = (props: FeedListItemProps) => {
  const { theme, item, onPress, styles } = props
  const itemType = item.displayType || item.type
  const isItemEmpty = itemType === 'empty'
  const itemStyle = getEventSettingsByType(theme, itemType)
  const imageStyle = {
    backgroundColor: itemStyle.color,
    backgroundImage: `url(${wavePattern})`,
  }
  const disableAnimForTests = Config.env === 'test'
  const easing = 'ease-in'

  if (isItemEmpty) {
    const simpleStore = SimpleStore.useStore()
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
        <Animatable.View animation={showLoadAnim ? animScheme : ''} duration={duration} easing={easing} useNativeDriver>
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
          useNativeDriver
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
          delay={400}
          easing={easing}
          useNativeDriver
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
    <Animatable.View animation={disableAnimForTests ? '' : 'fadeIn'} easing={easing} useNativeDriver>
      <TouchableHighlight
        activeOpacity={0.5}
        onPress={() => onPress(item.id)}
        style={styles.row}
        tvParallaxProperties={{ pressMagnification: 1.1 }}
        underlayColor={theme.colors.lightGray}
      >
        <View style={styles.rowContent}>
          <View style={[styles.rowContentBorder, imageStyle]} />
          <ListEventItem {...props} />
        </View>
      </TouchableHighlight>
    </Animatable.View>
  )
}

const getStylesFromProps = ({ theme }) => ({
  row: {
    borderRadius: theme.feedItems.borderRadius,
    flexDirection: 'row',
    marginTop: theme.sizes.default,
    overflow: 'hidden',
    shadowColor: theme.colors.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 1,
    height: theme.feedItems.height,
    marginHorizontal: theme.sizes.default,
    maxHeight: theme.feedItems.height,
    shadowOpacity: 0.16,
    shadowRadius: 4,
  },
  rowContent: {
    alignItems: 'center',
    backgroundColor: theme.feedItems.itemBackgroundColor,
    flex: 1,
    justifyContent: 'center',
    paddingLeft: theme.paddings.mainContainerPadding,
  },
  rowContentBorder: {
    backgroundRepeat: 'repeat-y',
    backgroundSize: 'initial',
    height: '100%',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: 10,
  },
})

export default withStyles(getStylesFromProps)(FeedListItem)
