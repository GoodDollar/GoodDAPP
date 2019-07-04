import React from 'react'
import { TouchableHighlight, View } from 'react-native'
import { withTheme } from 'react-native-paper'
import wavePattern from '../../../assets/wave.svg'
import ListEventItem from './ListEventItem'
import getEventSettingsByType from './EventSettingsByType'
import { listStyles } from './EventStyles'

/**
 * Render list item according to the type for feed list
 * @param {FeedEventProps} feedEvent - feed event
 * @returns {HTMLElement}
 */
const FeedListItem = props => {
  const imageStyle = {
    backgroundColor: getEventSettingsByType(props.theme, props.item.type).color,
    backgroundImage: `url(${wavePattern})`
  }
  return (
    <TouchableHighlight
      onPress={() => props.onPress(props.item.id)}
      tvParallaxProperties={{
        pressMagnification: 1.1
      }}
      style={listStyles.row}
      activeOpacity={0.1}
    >
      <View style={listStyles.rowContent}>
        <View style={[listStyles.rowContentBorder, imageStyle]} />
        <ListEventItem {...props} />
      </View>
    </TouchableHighlight>
  )
}

export default withTheme(FeedListItem)
