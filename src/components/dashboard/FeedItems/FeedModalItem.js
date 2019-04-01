import React from 'react'
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
  return <Modal {...props} />
}

export default FeedModalItem
