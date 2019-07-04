import React from 'react'
import { TouchableHighlight, View } from 'react-native'
import redBorder from '../../../assets/feeds/red-border.png'
import greenBorder from '../../../assets/feeds/green-border.png'
import purpleBorder from '../../../assets/feeds/purple-border.png'
import orangeBorder from '../../../assets/feeds/orange-border.png'
import lightBlueBorder from '../../../assets/feeds/light-blue-border.png'
import ListEventItem from './ListEventItem'
import { listStyles } from './EventStyles'

const colorsByType = {
  send: redBorder,
  receive: greenBorder,
  withdraw: greenBorder,
  message: purpleBorder,
  notification: orangeBorder,
  feedback: lightBlueBorder
}

const getBorderImage = type => ({
  backgroundImage: `url(${colorsByType[type]})`
})

/**
 * Render list item according to the type for feed list
 * @param {FeedEventProps} feedEvent - feed event
 * @returns {HTMLElement}
 */
const FeedListItem = props => {
  const imageStyle = getBorderImage(props.item.type)
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

export default FeedListItem
