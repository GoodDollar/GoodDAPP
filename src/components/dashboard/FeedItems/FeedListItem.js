import React from 'react'
import { TouchableHighlight, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { withStyles } from '../../../lib/styles'
import wavePattern from '../../../assets/wave.svg'
import ListEventItem from './ListEventItem'
import getEventSettingsByType from './EventSettingsByType'

/**
 * Render list item according to the type for feed list
 * @param {FeedEventProps} feedEvent - feed event
 * @returns {HTMLElement}
 */
const FeedListItem = props => {
  const { theme, item, onPress, styles } = props
  const imageStyle = {
    backgroundColor: getEventSettingsByType(theme, item.type).color,
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
    marginBottom: normalize(6),
    overflow: 'hidden',
    shadowColor: theme.colors.text,
    shadowOffset: {
      width: 0,
      height: normalize(2),
    },
    elevation: 1,
    minHeight: theme.feedItems.height,
    maxHeight: theme.feedItems.height,
    shadowOpacity: 0.16,
    shadowRadius: normalize(4),
  },
  rowContent: {
    alignItems: 'center',
    backgroundColor: theme.feedItems.itemBackgroundColor,
    flex: 1,
    justifyContent: 'center',
    paddingLeft: theme.paddings.mainContainerPadding,
    paddingRight: normalize(4),
  },
  rowContentBorder: {
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'initial',
    height: '100%',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: normalize(8),
  },
})

export default withStyles(getStylesFromProps)(FeedListItem)
