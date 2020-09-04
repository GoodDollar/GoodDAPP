// @flow

import React, { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import { pickBy } from 'lodash'

import CustomButton from '../buttons/CustomButton'
import ShareButton from '../buttons/ShareButton'

import useNativeSharing from '../../../lib/hooks/useNativeSharing'
import { useErrorDialog } from '../../../lib/undux/utils/dialog'

import GDStore from '../../../lib/undux/GDStore'

import logger from '../../../lib/logger/pino-logger'
import { decorate, ExceptionCategory, ExceptionCode } from '../../../lib/logger/exceptions'
import normalize from '../../../lib/utils/normalizeText'
import userStorage from '../../../lib/gundb/UserStorage'
import goodWallet from '../../../lib/wallet/GoodWallet'
import { withStyles } from '../../../lib/styles'

import { CLICK_BTN_CARD_ACTION, fireEvent } from '../../../lib/analytics/analytics'
import config from '../../../config/config'
import useOnPress from '../../../lib/hooks/useOnPress'

const log = logger.child({ from: 'ModalActionsByFeed' })

const ModalButton = ({ children, ...props }) => (
  <CustomButton mode="contained" style={{ minWidth: 96 }} {...props}>
    {children}
  </CustomButton>
)

const ModalActionsByFeedType = ({ theme, styles, item, handleModalClose, navigation }) => {
  const [showErrorDialog] = useErrorDialog()
  const { canShare, generateSendShareObject, generateSendShareText, generateShareLink } = useNativeSharing()

  const store = GDStore.useStore()
  const inviteCode = store.get('inviteCode')
  const _handleModalClose = useOnPress(handleModalClose)
  const { fullName: currentUserName } = store.get('profile')

  const [cancellingPayment, setCancellingPayment] = useState(false)
  const [paymentLinkForShare, setPaymentLinkForShare] = useState(null)

  const fireEventAnalytics = actionType => {
    fireEvent(CLICK_BTN_CARD_ACTION, { cardId: item.id, actionType })
  }

  const handleCancelFailed = useCallback(
    (exception, code, category = null) => {
      const { message } = exception

      decorate(exception, code)
      userStorage.updateOTPLEventStatus(item.id, 'pending')
      showErrorDialog('The payment could not be canceled at this time. Please try again.', code)
      log.error('cancel payment failed', message, exception, pickBy({ dialogShown: true, code, category }))
    },
    [item, setCancellingPayment, showErrorDialog],
  )

  const cancelPayment = useCallback(async () => {
    const { Blockchain } = ExceptionCategory

    log.info({ item, action: 'cancelPayment' })
    fireEventAnalytics('cancelPayment')

    if (item.status === 'pending') {
      // if status is 'pending' trying to cancel a tx that doesn't exist will fail and may confuse the user
      showErrorDialog("The transaction is still pending, it can't be cancelled right now")
      return
    }

    setCancellingPayment(true)

    try {
      goodWallet
        .cancelOTLByTransactionHash(item.id)
        .catch(exception => handleCancelFailed(exception, ExceptionCode.E10, Blockchain))
        .finally(() => setCancellingPayment(false))

      await userStorage.cancelOTPLEvent(item.id)
    } catch (exception) {
      setCancellingPayment(false)
      handleCancelFailed(exception, ExceptionCode.E12)
    }

    handleModalClose()
  }, [item, handleCancelFailed, setCancellingPayment, handleModalClose])

  const generatePaymentLinkForShare = useCallback(() => {
    const { withdrawCode, message, amount, endpoint = {} } = item.data || {}
    const { fullName } = endpoint

    try {
      const url = generateShareLink(
        'send',
        pickBy({
          p: withdrawCode,
          r: message,
          i: inviteCode,
        }),
      )

      let result
      let shareArgs = [url, amount, fullName, currentUserName]
      let shareFn = generateSendShareText

      if (canShare) {
        shareFn = generateSendShareObject
        shareArgs.push(canShare)
      }

      result = shareFn(...shareArgs)

      if (!canShare) {
        result = { url: result }
      }

      return result
    } catch (exception) {
      const { message } = exception

      log.error('generatePaymentLinkForShare Failed', message, exception, { item, canShare })
      return null
    }
  }, [generateShareLink, item, canShare, generateSendShareText, generateSendShareObject, inviteCode])

  const readMore = useOnPress(() => {
    fireEventAnalytics('readMore')
    log.info({ item, action: 'readMore' })
    handleModalClose()
  }, [handleModalClose, item])

  const shareMessage = useOnPress(() => {
    fireEventAnalytics('shareMessage')
    log.info({ item, action: 'shareMessage' })
    handleModalClose()
  }, [handleModalClose, item])

  const invitePeople = useOnPress(() => {
    fireEventAnalytics('Rewards')
    navigation.navigate('Rewards')
    handleModalClose()
  }, [handleModalClose, navigation])

  const Marketplace = useOnPress(() => {
    fireEventAnalytics('Marketplace')
    navigation.navigate('Marketplace')
    handleModalClose()
  }, [handleModalClose, navigation])

  const backupPage = useOnPress(() => {
    fireEventAnalytics('BackupWallet')
    navigation.navigate('BackupWallet')
    handleModalClose()
  }, [handleModalClose, navigation])

  const goToClaimPage = useOnPress(() => {
    fireEventAnalytics('Claim')
    navigation.navigate('Claim')
    handleModalClose()
  }, [handleModalClose, navigation])

  const shareLinkClicked = useCallback(() => fireEventAnalytics('Sharelink'), [])

  useEffect(() => {
    if ('sendpending' !== item.displayType) {
      return
    }

    setPaymentLinkForShare(generatePaymentLinkForShare())
  }, [])

  switch (item.displayType) {
    case 'welcome':
      return (
        <View style={styles.buttonsView}>
          <View style={styles.rightButtonContainer}>
            <ModalButton fontWeight="medium" onPress={handleModalClose}>
              {config.isPhaseZero ? 'OK' : 'LET`S DO IT'}
            </ModalButton>
          </View>
        </View>
      )

    case 'sendpending':
      return (
        <>
          <View style={[styles.buttonsView, styles.spaceBetween]}>
            <CustomButton
              mode="outlined"
              style={[styles.button, styles.cancelButton, { borderColor: theme.colors.red }]}
              onPress={cancelPayment}
              color={theme.colors.red}
              loading={cancellingPayment}
              textStyle={styles.smallButtonTextStyle}
            >
              Cancel link
            </CustomButton>
            <ShareButton
              disabled={!paymentLinkForShare}
              share={paymentLinkForShare}
              onPressed={shareLinkClicked}
              actionText="Share link"
              mode="outlined"
              style={[styles.rightButton, styles.shareButton]}
              iconColor={theme.colors.primary}
              textStyle={styles.smallButtonTextStyle}
            />
          </View>
          <View style={styles.buttonsView}>
            <View style={styles.rightButtonContainer}>
              <CustomButton mode="contained" style={styles.rightButton} fontWeight="medium" onPress={_handleModalClose}>
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
            <ModalButton fontWeight="medium" mode="outlined" onPress={readMore}>
              Read more
            </ModalButton>
          </View>
          <View style={styles.rightButtonContainer}>
            <ModalButton fontWeight="medium" onPress={shareMessage}>
              Share
            </ModalButton>
          </View>
        </View>
      )
    case 'invite':
      return (
        <View style={styles.buttonsView}>
          <View style={styles.rightButtonContainer}>
            <ModalButton fontWeight="medium" mode="text" color="gray80Percent" onPress={_handleModalClose}>
              LATER
            </ModalButton>
          </View>
          <View style={styles.rightButtonContainer}>
            <ModalButton
              mode="contained"
              onPress={invitePeople}
              iconAlignment="right"
              iconSize={20}
              icon="invite"
              iconStyle={styles.iconStyle}
              fontWeight="medium"
            >
              INVITE
            </ModalButton>
          </View>
        </View>
      )
    case 'spending':
      return (
        <View style={styles.buttonsView}>
          <View style={styles.rightButtonContainer}>
            <ModalButton fontWeight="medium" mode="text" color="gray80Percent" onPress={_handleModalClose}>
              LATER
            </ModalButton>
          </View>
          <View style={styles.rightButtonContainer}>
            <ModalButton fontWeight="medium" onPress={Marketplace} iconAlignment="right">
              {"LET'S GO"}
            </ModalButton>
          </View>
        </View>
      )
    case 'backup':
      return (
        <View style={styles.buttonsView}>
          <View style={styles.rightButtonContainer}>
            <ModalButton fontWeight="medium" onPress={backupPage}>
              {"LET'S BACKUP"}
            </ModalButton>
          </View>
        </View>
      )

    case 'claiming':
      return (
        <View style={styles.buttonsView}>
          <View style={styles.rightButtonContainer}>
            <ModalButton fontWeight="medium" onPress={goToClaimPage}>
              CLAIM G$
            </ModalButton>
          </View>
        </View>
      )

    case 'hanukaStarts':
      return (
        <View style={styles.buttonsView}>
          <View style={styles.rightButtonContainer}>
            <ModalButton fontWeight="medium" mode="contained" onPress={goToClaimPage}>
              Claim now
            </ModalButton>
          </View>
        </View>
      )

    case 'feedback':
      return (
        <View style={styles.buttonsView}>
          <ModalButton fontWeight="medium" onPress={_handleModalClose}>
            Later
          </ModalButton>
        </View>
      )
    case 'empty':
      return null
    default:
      // claim / receive / withdraw / notification / sendcancelled / sendcompleted
      return (
        <View style={styles.buttonsView}>
          <ModalButton fontWeight="medium" mode="contained" onPress={_handleModalClose}>
            Ok
          </ModalButton>
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
  iconStyle: {
    marginLeft: theme.sizes.defaultHalf,
    marginBottom: 3,
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
  smallButtonTextStyle: {
    fontSize: normalize(14),
    letterSpacing: 0,
  },
})

export default withStyles(getStylesFromProps)(ModalActionsByFeedType)
