// @flow
import React from 'react'
import { StyleSheet, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import ModalWithdrawEvent from './ModalWithdrawEvent'
import ModalSendEvent from './ModalSendEvent'
import ModalClaimEvent from './ModalClaimEvent'
import type { FeedEventProps } from './EventProps'

const modalType = type => {
  return (
    {
      withdraw: ModalWithdrawEvent,
      send: ModalSendEvent,
      claim: ModalClaimEvent
    }[type] || ModalWithdrawEvent
  )
}

/**
 * Render modal item according to the type for feed list in horizontal view
 * @param {FeedEventProps} props - feed event
 * @returns {HTMLElement}
 */
const FeedModalItem = (props: FeedEventProps) => {
  const Modal = modalType(props.item.type)
  return (
    <View style={props.styles ? { ...styles.horizItem, ...props.styles } : styles.horizItem}>
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
