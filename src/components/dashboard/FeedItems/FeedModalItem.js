import React from 'react'
import { StyleSheet, TouchableHighlight, View } from 'react-native'
import { normalize } from 'react-native-elements'
import ModalWithdrawEvent from './ModalWithdrawEvent'
import ModalSendEvent from './ModalSendEvent'

const modalType = type => {
  return (
    {
      withdraw: ModalWithdrawEvent,
      send: ModalSendEvent
    }[type] || ModalWithdrawEvent
  )
}

const FeedModalItem = props => {
  const Modal = modalType(props.item.type)
  return (
    <TouchableHighlight
      onPress={() => props.onPress(props.item.id)}
      onShowUnderlay={props.separators.highlight}
      onHideUnderlay={props.separators.unhighlight}
      tvParallaxProperties={{
        pressMagnification: 1.1
      }}
      style={[styles.horizItem, { height: '90vh', width: '95vw', marginRight: normalize(10) }]}
    >
      <View style={styles.fullHeight}>
        <Modal {...props} />
      </View>
    </TouchableHighlight>
  )
}

const styles = StyleSheet.create({
  horizItem: {
    flex: 1,
    alignSelf: 'flex-start' // Necessary for touch highlight
  },
  fullHeight: {
    height: '100%',
    flex: 1
  }
})

export default FeedModalItem
