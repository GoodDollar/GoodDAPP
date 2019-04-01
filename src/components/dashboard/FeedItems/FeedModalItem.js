import React from 'react'
import { StyleSheet, TouchableHighlight, View } from 'react-native'
import { normalize } from 'react-native-elements'
import ModalWithdrawEvent from './ModalWithdrawEvent'
import ModalSendEvent from './ModalSendEvent'
import ModalNotificationEvent from './ModalNotificationEvent'
import ModalMessageEvent from './ModalMessageEvent'
import ModalConfirmationEvent from './ModalConfirmationEvent'

const modalType = type => {
  return (
    {
      withdraw: ModalWithdrawEvent,
      send: ModalSendEvent,
      notification: ModalNotificationEvent,
      message: ModalMessageEvent,
      confirmation: ModalConfirmationEvent
    }[type] || ModalMessageEvent
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
    height: '100%'
  }
})

export default FeedModalItem
