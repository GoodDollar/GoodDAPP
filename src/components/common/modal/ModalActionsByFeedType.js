// @flow
import React, { useState } from 'react'
import { View } from 'react-native'
import CustomButton from '../buttons/CustomButton'
import CopyButton from '../buttons/CopyButton'
import logger from '../../../lib/logger/pino-logger'
import goodWallet from '../../../lib/wallet/GoodWallet'
import { generateShareLink } from '../../../lib/share'
import { useErrorDialog } from '../../../lib/undux/utils/dialog'
import { withStyles } from '../../../lib/styles'

const log = logger.child({ from: 'ModalActionsByFeed' })

const ModalActionsByFeedType = ({ theme, styles, item, handleModalClose }) => {
  const [showErrorDialog] = useErrorDialog()
  const [state, setState] = useState({})

  const cancelPayment = () => {
    log.info({ item, action: 'cancelPayment' })
    setState({ ...state, cancelPaymentLoading: true })
    try {
      goodWallet
        .cancelOTLByTransactionHash(item.id)
        .catch(e => showErrorDialog('Canceling the payment link has failed', e))
        .finally(() => {
          setState({ ...state, cancelPaymentLoading: false })
        })
    } catch (e) {
      setState({ ...state, cancelPaymentLoading: false })
      showErrorDialog(e)
    }
    handleModalClose()
  }

  const getPaymentLink = () =>
    generateShareLink('send', {
      paymentCode: item.id,
      reason: item.data.message,
    })

  const readMore = () => {
    log.info({ item, action: 'readMore' })
    handleModalClose()
  }
  const shareMessage = () => {
    log.info({ item, action: 'shareMessage' })
    handleModalClose()
  }
  const invitePeople = () => {
    log.info({ item, action: 'invitePeople' })
    handleModalClose()
  }

  switch (item.type) {
    case 'send':
      return (
        <>
          <View style={styles.buttonsView}>
            <CustomButton
              mode="outlined"
              style={[styles.button, { borderColor: theme.colors.red }]}
              onPress={cancelPayment}
              color={theme.colors.red}
              loading={state.cancelPaymentLoading}
            >
              Cancel payment link
            </CustomButton>
            <CopyButton
              mode="outlined"
              style={styles.rightButton}
              toCopy={getPaymentLink()}
              onPressDone={handleModalClose}
              iconColor={theme.colors.primary}
              withoutDone={true}
            >
              Copy link
            </CopyButton>
          </View>
          <View style={styles.buttonsView}>
            <CustomButton mode="contained" style={styles.rightButton} onPress={handleModalClose}>
              Ok
            </CustomButton>
          </View>
        </>
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
          <CustomButton
            mode="contained"
            style={styles.rightButton}
            onPress={invitePeople}
            iconAlignment="right"
            icon="invite"
          >
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
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 'auto',
    flexWrap: 'wrap',
  },
  button: {
    minWidth: 80,
  },
  rightButton: {
    marginLeft: theme.sizes.default,
    marginTop: theme.sizes.default,
    minWidth: 80,
  },
})

export default withStyles(getStylesFromProps)(ModalActionsByFeedType)
