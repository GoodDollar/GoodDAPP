// @flow
import React from 'react'
import { View } from 'react-native'
import CustomButton from '../buttons/CustomButton'
import logger from '../../../lib/logger/pino-logger'
import { withStyles } from '../../../lib/styles'

const log = logger.child({ from: 'ModalActionsByFeed' })

const ModalActionsByFeedType = ({ theme, styles, item, handleModalClose }) => {
  const cancelPayment = () => {
    log({ item, action: 'cancelPayment' })
  }
  const copyPaymentLink = () => {
    log({ item, action: 'copyPaymentLink' })
  }
  const readMore = () => {
    log({ item, action: 'readMore' })
  }
  const shareMessage = () => {
    log({ item, action: 'shareMessage' })
  }
  const invitePeople = () => {
    log({ item, action: 'invitePeople' })
  }

  switch (item.type) {
    case 'send':
      return (
        <View style={styles.buttonsView}>
          <CustomButton mode="outlined" style={styles.button} onPress={cancelPayment} color={theme.colors.red}>
            Cancel payment
          </CustomButton>
          <CustomButton mode="outlined" style={styles.rightButton} onPress={copyPaymentLink}>
            Copy link
          </CustomButton>
          <CustomButton mode="contained" style={styles.rightButton} onPress={handleModalClose}>
            Ok
          </CustomButton>
        </View>
      )
    case 'message':
      return (
        <View style={styles.buttonsView}>
          <CustomButton mode="outlined" style={styles.button} onPress={readMore}>
            Read more
          </CustomButton>
          <CustomButton mode="contained" style={styles.rightButton} onPress={shareMessage}>
            Share
          </CustomButton>
        </View>
      )
    case 'invite':
      return (
        <View style={styles.buttonsView}>
          <CustomButton mode="text" style={styles.button} onPress={handleModalClose}>
            Later
          </CustomButton>
          <CustomButton mode="contained" style={styles.rightButton} onPress={invitePeople}>
            Invite
          </CustomButton>
        </View>
      )
    case 'feedback':
      return (
        <View style={styles.buttonsView}>
          <CustomButton mode="contained" style={styles.button} onPress={handleModalClose}>
            Later
          </CustomButton>
        </View>
      )
    case 'empty':
      return null
    default:
      // Claim / Receive / Withdraw / Notification
      return (
        <View style={styles.buttonsView}>
          <CustomButton mode="contained" style={styles.button} onPress={handleModalClose}>
            Ok
          </CustomButton>
        </View>
      )
  }
}

const getStylesFromProps = ({ theme }) => ({
  buttonsView: {
    alignItems: 'flex-end',
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.sizes.defaultDouble,
  },
  button: {
    minWidth: 80,
  },
  rightButton: {
    marginLeft: theme.sizes.default,
    minWidth: 80,
  },
})

export default withStyles(getStylesFromProps)(ModalActionsByFeedType)
