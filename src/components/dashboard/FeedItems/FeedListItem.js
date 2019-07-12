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
      onPress={() => onPress(item.id)}
      tvParallaxProperties={{
        pressMagnification: 1.1,
      }}
      style={styles.row}
      activeOpacity={0.1}
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
    flexDirection: 'row',
    marginBottom: normalize(4),
    backgroundColor: theme.colors.surface,
    borderRadius: normalize(8),
    overflow: 'hidden',
    shadowColor: theme.colors.text,
    shadowOffset: {
      width: 0,
      height: normalize(2),
    },
    shadowOpacity: 0.16,
    shadowRadius: normalize(4),
    elevation: 1,
    height: normalize(84),
    maxHeight: normalize(84),
  },
  rowContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    paddingLeft: theme.paddings.mainContainerPadding,
    paddingRight: normalize(4),
  },
  rowContentBorder: {
    backgroundRepeat: 'no-repeat',
    height: '100%',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: normalize(8),
    backgroundSize: 'initial',
  },
})

export default withStyles(getStylesFromProps)(FeedListItem)
