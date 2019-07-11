import React from 'react'
import { TouchableHighlight, View } from 'react-native'
import wavePattern from '../../../assets/wave.svg'
import { withStyles } from '../../../lib/styles'
import ListEventItem from './ListEventItem'
import getEventSettingsByType from './EventSettingsByType'
import { listStyles } from './EventStyles'

/**
 * Render list item according to the type for feed list
 * @param {FeedEventProps} feedEvent - feed event
 * @returns {HTMLElement}
 */
const FeedListItem = props => {
  const { theme, item } = props
  const imageStyle = {
    backgroundColor: getEventSettingsByType(theme, item.type).color,
    backgroundImage: `url(${wavePattern})`
  }

  return (
    <TouchableHighlight
      activeOpacity={0.5}
      onPress={() => props.onPress(props.item.id)}
      style={listStyles.row}
      tvParallaxProperties={{ pressMagnification: 1.1 }}
      underlayColor={theme.colors.lightGray}
    >
      <View style={[listStyles.rowContent]}>
        <View style={[listStyles.rowContentBorder, imageStyle]} />
        <ListEventItem {...props} />
      </View>
    </TouchableHighlight>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {}
}

export default withStyles(getStylesFromProps)(FeedListItem)
