// @flow

import React, { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import { get, pickBy } from 'lodash'

import CustomButton from '../buttons/CustomButton'
import ShareButton from '../buttons/ShareButton'

import { useErrorDialog } from '../../../lib/undux/utils/dialog'

import logger from '../../../lib/logger/js-logger'
import { decorate, ExceptionCategory, ExceptionCode } from '../../../lib/exceptions/utils'
import normalize from '../../../lib/utils/normalizeText'
import { useUserStorage, useWallet } from '../../../lib/wallet/GoodWalletProvider'
import { openLink } from '../../../lib/utils/linking'
import { withStyles } from '../../../lib/styles'
import Section from '../../common/layout/Section'

import { CLICK_BTN_CARD_ACTION, fireEvent } from '../../../lib/analytics/analytics'
import config from '../../../config/config'

import { generateSendShareObject, generateShareLink, isSharingAvailable } from '../../../lib/share'
import useProfile from '../../../lib/userStorage/useProfile'

const log = logger.child({ from: 'ModalActionsByFeed' })

const ModalButton = ({ children, ...props }) => (
  <CustomButton mode="contained" style={{ minWidth: 96 }} {...props}>
    {children}
  </CustomButton>
)

const ModalActionsByFeedType = ({ theme, styles, item, handleModalClose, navigation }) => {
  const [showErrorDialog] = useErrorDialog()
  const goodWallet = useWallet()
  const userStorage = useUserStorage()

  const _handleModalClose = useCallback(handleModalClose)
  const inviteCode = userStorage.userProperties.get('inviteCode')
  const { fullName: currentUserName } = useProfile()

  const [cancellingPayment, setCancellingPayment] = useState(false)
  const [paymentLinkForShare, setPaymentLinkForShare] = useState({})

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
    [item, setCancellingPayment, showErrorDialog, userStorage],
  )

  const cancelPayment = useCallback(async () => {
    const { Blockchain } = ExceptionCategory

    log.info({ item, action: 'cancelPayment' })
    fireEventAnalytics('cancelPayment')

    const canCancel = item && item.displayType === 'sendpending'

    if (!canCancel) {
      // if status is 'pending' trying to cancel a tx that doesn't exist will fail and may confuse the user
      showErrorDialog("The transaction is still pending, it can't be cancelled right now")
      return
    }

    setCancellingPayment(true)

    try {
      await userStorage.cancelOTPLEvent(item.id)
      goodWallet
        .cancelOTLByTransactionHash(item.id)
        .catch(exception => handleCancelFailed(exception, ExceptionCode.E10, Blockchain))
        .finally(() => setCancellingPayment(false))
    } catch (exception) {
      setCancellingPayment(false)
      handleCancelFailed(exception, ExceptionCode.E12)
    }

    handleModalClose()
  }, [item, handleCancelFailed, setCancellingPayment, handleModalClose, goodWallet, userStorage])

  const generatePaymentLinkForShare = useCallback(() => {
    const { withdrawCode, message, amount, endpoint = {} } = item.data || {}
    const { displayName } = endpoint

    try {
      const url = generateShareLink(
        'send',
        pickBy({
          p: withdrawCode,
          r: message,
          i: inviteCode,
        }),
      )

      let result = generateSendShareObject(url, amount, displayName, currentUserName)

      return result
    } catch (exception) {
      const { message } = exception

      log.error('generatePaymentLinkForShare Failed', message, exception, { item, isSharingAvailable })
      return null
    }
  }, [item, inviteCode])

  const readMore = useCallback(() => {
    fireEventAnalytics('readMore')
    log.info({ item, action: 'readMore' })
    handleModalClose()
  }, [handleModalClose, item])

  const shareMessage = useCallback(() => {
    fireEventAnalytics('shareMessage')
    log.info({ item, action: 'shareMessage' })
    handleModalClose()
  }, [handleModalClose, item])

  const invitePeople = useCallback(() => {
    fireEventAnalytics('Rewards')
    navigation.navigate('Rewards')
    handleModalClose()
  }, [handleModalClose, navigation])

  const backupPage = useCallback(() => {
    fireEventAnalytics('BackupWallet')
    navigation.navigate('BackupWallet')
    handleModalClose()
  }, [handleModalClose, navigation])

  const goToClaimPage = useCallback(() => {
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
            <ModalButton fontWeight="medium" onPress={_handleModalClose}>
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
              actionText={isSharingAvailable ? 'Share link' : 'Copy link'}
              mode="outlined"
              style={[styles.rightButton, styles.shareButton]}
              iconColor={theme.colors.primary}
              textStyle={styles.smallButtonTextStyle}
              withoutDone={true}
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
    default: {
      const txHash = get(item, 'data.receiptHash', item.id)
      const isTx = txHash.startsWith('0x')

      // claim / receive / withdraw / notification / sendcancelled / sendcompleted
      return (
        <Section.Row style={[styles.buttonsView, isTx && styles.linkButtonView]}>
          {isTx && (
            <Section.Stack style={styles.txHashWrapper}>
              <Section.Text
                fontSize={11}
                textDecorationLine="underline"
                onPress={() => openLink('https://explorer.fuse.io/tx/' + txHash)}
                textAlign="left"
              >
                {`Transaction Details`}
              </Section.Text>
              <Section.Text
                fontSize={11}
                numberOfLines={1}
                ellipsizeMode="middle"
                style={styles.txHash}
                textAlign="left"
              >
                {txHash}
              </Section.Text>
            </Section.Stack>
          )}
          <ModalButton fontWeight="medium" mode="contained" onPress={_handleModalClose}>
            Ok
          </ModalButton>
        </Section.Row>
      )
    }
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
    width: '100%',
  },
  linkButtonView: {
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  txHashWrapper: { justifyContent: 'center', alignItems: 'flex-start', flexDirection: 'column' },
  txHash: { maxWidth: 200 },
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
