// @flow
import React from 'react'
import { TouchableHighlight, View } from 'react-native'
import type { FeedEvent } from '../../../lib/gundb/UserStorageClass'
import { withStyles } from '../../../lib/styles'
import wavePattern from '../../../assets/feedListItemPattern.svg'
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
  const itemStyle = getEventSettingsByType(theme, item.displayType || item.type)
  const imageStyle = {
    backgroundColor: itemStyle.color,
    backgroundImage: `url(${wavePattern})`,
  }

  return (
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
