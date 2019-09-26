// @flow
import React, { useState } from 'react'
import { View } from 'react-native'
import CustomButton from '../buttons/CustomButton'
import ShareButton from '../buttons/ShareButton'
import logger from '../../../lib/logger/pino-logger'
import normalize from '../../../lib/utils/normalizeText'
import userStorage from '../../../lib/gundb/UserStorage'
import goodWallet from '../../../lib/wallet/GoodWallet'
import { generateSendShareObject, generateShareLink } from '../../../lib/share'
import { useErrorDialog } from '../../../lib/undux/utils/dialog'
import { withStyles } from '../../../lib/styles'
import GDStore from '../../../lib/undux/GDStore'

const log = logger.child({ from: 'ModalActionsByFeed' })

const ModalActionsByFeedType = ({ theme, styles, item, handleModalClose }) => {
  const [showErrorDialog] = useErrorDialog()
  const [state, setState] = useState({})
  const store = GDStore.useStore()
  const currentUserName = store.get('profile').fullName

  const cancelPayment = async () => {
    log.info({ item, action: 'cancelPayment' })

    if (item.status === 'pending') {
      // if status is 'pending' trying to cancel a tx that doesn't exist will fail and may confuse the user
      showErrorDialog("Current transaction is still pending, it can't be cancelled right now")
    } else {
      setState({ ...state, cancelPaymentLoading: true })
      try {
        await userStorage.deleteEvent(item.id)

        goodWallet
          .cancelOTLByTransactionHash(item.id)
          .catch(e => {
            userStorage.recoverEvent(item.id)
            showErrorDialog('Canceling the payment link has failed', e)
          })
          .finally(() => {
            setState({ ...state, cancelPaymentLoading: false })
          })
      } catch (e) {
        setState({ ...state, cancelPaymentLoading: false })
        showErrorDialog(e)
      }
    }
    handleModalClose()
  }

  const getPaymentLink = () => {
    const url = generateShareLink('send', {
      paymentCode: item.data.withdrawCode,
      reason: item.data.message,
    })

    return generateSendShareObject(url, item.data.amount, item.data.endpoint.fullName, currentUserName)
  }

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

  switch (item.displayType) {
    case 'sendpending':
      return (
        <>
          <View style={[styles.buttonsView, styles.spaceBetween]}>
            <CustomButton
              mode="outlined"
              style={[styles.button, styles.cancelButton, { borderColor: theme.colors.red }]}
              onPress={cancelPayment}
              color={theme.colors.red}
              loading={state.cancelPaymentLoading}
              textStyle={styles.buttonTextStyle}
            >
              Cancel link
            </CustomButton>
            <ShareButton
              share={getPaymentLink()}
              actionText="Share link"
              mode="outlined"
              style={[styles.rightButton, styles.shareButton]}
              iconColor={theme.colors.primary}
              textStyle={styles.buttonTextStyle}
            />
          </View>
          <View style={styles.buttonsView}>
            <View style={styles.rightButtonContainer}>
              <CustomButton mode="contained" style={styles.rightButton} onPress={handleModalClose}>
                Ok
              </CustomButton>
            </View>
          </View>
        </>
      )
    case 'message':
      return (
        <View style={styles.buttonsView}>
          <View style={styles.rightButtonContainer}>
            <CustomButton mode="outlined" style={styles.button} onPress={readMore}>
              Read more
            </CustomButton>
          </View>
          <View style={styles.rightButtonContainer}>
            <CustomButton mode="contained" style={styles.rightButton} onPress={shareMessage}>
              Share
            </CustomButton>
          </View>
        </View>
      )
    case 'invite':
      return (
        <View style={styles.buttonsView}>
          <View style={styles.rightButtonContainer}>
            <CustomButton mode="text" style={styles.button} onPress={handleModalClose}>
              Later
            </CustomButton>
          </View>
          <View style={styles.rightButtonContainer}>
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
      // claim / receive / withdraw / notification / sendcancelled / sendcompleted
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
    marginTop: theme.sizes.defaultHalf,
    flexWrap: 'wrap',
    marginHorizontal: -theme.sizes.defaultHalf,
    width: '100%',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  shareButton: {
    width: '48%',
  },
  cancelButton: {
    width: '48%',
  },
  button: {
    minWidth: 96,
  },
  rightButton: {
    minWidth: 96,
  },
  rightButtonContainer: {
    marginLeft: theme.sizes.default,
    marginTop: theme.sizes.default,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  buttonTextStyle: {
    fontSize: normalize(14),
    letterSpacing: 0,
  },
})

export default withStyles(getStylesFromProps)(ModalActionsByFeedType)
