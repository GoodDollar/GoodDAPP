import React from 'react'
import { StyleSheet, View } from 'react-native'
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

/**
 * Render modal item according to the type for feed list in horizontal view
 * @param {FeedEventProps} props - feed event
 * @returns {HTMLElement}
 */
const FeedModalItem = props => {
  const Modal = modalType(props.item.type)
  return (
    <View style={styles.horizItem}>
      <View style={styles.fullHeight}>
        <Modal {...props} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  horizItem: {
    flex: 1,
    alignSelf: 'flex-start', // Necessary for touch highlight
    height: '90vh',
    width: '95vw',
    marginRight: normalize(10)
  },
  fullHeight: {
    height: '100%',
    flex: 1
  }
})

export default FeedModalItem
