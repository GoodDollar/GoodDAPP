// @flow

import React, { useCallback, useEffect, useState } from 'react'
import { get } from 'lodash'
import { text } from 'react-native-communications'
import { fireEvent } from '../../lib/analytics/analytics'
import GDStore from '../../lib/undux/GDStore'
import Config from '../../config/config'
import gun from '../../lib/gundb/gundb'
import userStorage, { type TransactionEvent } from '../../lib/gundb/UserStorage'
import logger from '../../lib/logger/pino-logger'
import { ExceptionCategory } from '../../lib/logger/exceptions'
import { useDialog } from '../../lib/undux/utils/dialog'
import goodWallet from '../../lib/wallet/GoodWallet'
import { useScreenState } from '../appNavigation/stackNavigation'
import { generateSendShareObject, generateSendShareText } from '../../lib/share'
import { ACTION_SEND, ACTION_SEND_TO_ADDRESS, SEND_TITLE } from './utils/sendReceiveFlow'
import SummaryGeneric from './SendReceive/SummaryGeneric'

const log = logger.child({ from: 'SendLinkSummary' })

export type AmountProps = {
  screenProps: any,
  navigation: any,
}

/**
 * Screen that shows transaction summary for a send link action
 * @param {AmountProps} props
 * @param {any} props.screenProps
 */
const SendLinkSummary = ({ screenProps, styles }: AmountProps) => {
  const gdstore = GDStore.useStore()
  const inviteCode = userStorage.userProperties.get('inviteCode')
  const [screenState] = useScreenState(screenProps)
  const [showDialog, hideDialog, showErrorDialog] = useDialog()

  const [shared, setShared] = useState(false)
  const [survey] = useState('other')
  const [link, setLink] = useState('')

  const { goToRoot, navigateTo } = screenProps
  const { fullName } = gdstore.get('profile')
  const { amount, reason = null, counterPartyDisplayName, contact, address, action } = screenState

  const handleConfirm = useCallback(async () => {
    if (action === ACTION_SEND_TO_ADDRESS) {
      await sendViaAddress()
    } else {
      handlePayment()
    }
  }, [amount, reason, counterPartyDisplayName, setShared, showDialog, screenProps])

  const sendPayment = to => {
    try {
      let txhash
      goodWallet.sendAmount(to, amount, {
        onTransactionHash: hash => {
          txhash = hash

          // Save transaction
          const transactionEvent: TransactionEvent = {
            id: hash,
            date: new Date().toString(),
            type: 'send',
            data: {
              to,
              reason,
              amount,
            },
          }
          userStorage.enqueueTX(transactionEvent)

          if (Config.isEToro) {
            userStorage.saveSurveyDetails(hash, {
              reason,
              amount,
              survey,
            })
          }

          fireEvent('SEND_DONE', { type: 'contact' }) //this is called if address was from phone number

          showDialog({
            visible: true,
            title: 'SUCCESS!',
            message: 'The G$ was sent successfully',
            buttons: [{ text: 'Yay!' }],
            onDismiss: setShared(true),
          })

          return hash
        },
        onError: e => {
          log.error('Send TX failed:', e.message, e)
          userStorage.markWithErrorEvent(txhash)
        },
      })
    } catch (e) {
      log.error('Send TX failed:', e.message, e)

      showErrorDialog({
        visible: true,
        title: 'Transaction Failed!',
        message: `There was a problem sending G$. Try again`,
        dismissText: 'OK',
      })
    }
  }

  // Going to root after shared
  useEffect(() => {
    if (shared) {
      screenProps.goToRoot()
    }
  }, [shared])

  const handlePayment = useCallback(async () => {
    let paymentLink = link
    let walletAddress
    const { phoneNumber } = contact || ''

    if (phoneNumber) {
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '')

      const profileKey = await userStorage.getUserProfilePublickey(cleanPhoneNumber)
      walletAddress = await gun
        .get(profileKey)
        .get('profile')
        .get('walletAddress')
        .get('display')
    }

    if (phoneNumber) {
      if (walletAddress) {
        sendPayment(walletAddress)
      } else {
        const link = paymentLink ? paymentLink : getLink()
        const shareLink = generateSendShareText(link, amount, counterPartyDisplayName, fullName)

        text(contact.phoneNumber, shareLink)
        setShared(true)
      }
    } else {
      sendViaLink()
    }
  }, [action, amount, counterPartyDisplayName, fullName])

  const sendViaAddress = useCallback(async () => {
    try {
      let txhash
      await goodWallet.sendAmount(address, amount, {
        onTransactionHash: hash => {
          log.debug('Send G$ to address', { hash })
          txhash = hash

          // Save transaction
          const transactionEvent: TransactionEvent = {
            id: hash,
            date: new Date().toString(),
            type: 'send',
            data: {
              to: address,
              reason,
              amount,
            },
          }

          userStorage.enqueueTX(transactionEvent)

          if (Config.isEToro) {
            userStorage.saveSurveyDetails(hash, {
              amount,
              survey,
            })
          }

          fireEvent('SEND_DONE', { type: get(screenState, 'params.type', 'Address') })

          showDialog({
            visible: true,
            title: 'SUCCESS!',
            message: 'The G$ was sent successfully',
            buttons: [{ text: 'Yay!' }],
            onDismiss: goToRoot,
          })

          return hash
        },
        onError: e => {
          log.error('Send TX failed:', e.message, e, { category: ExceptionCategory.Blockhain })

          userStorage.markWithErrorEvent(txhash)
        },
      })
    } catch (e) {
      log.error('Send TX failed:', e.message, e, {
        category: ExceptionCategory.Blockhain,
        dialogShown: true,
      })

      showErrorDialog({
        visible: true,
        title: 'Transaction Failed!',
        message: `There was a problem sending G$. Check payment details.`,
        dismissText: 'OK',
      })
    }
  }, [address, amount, reason, showDialog, showErrorDialog, goToRoot])

  const sendViaLink = useCallback(() => {
    try {
      const paymentLink = getLink()
      const desktopShareLink = generateSendShareObject(paymentLink, amount, counterPartyDisplayName, fullName)

      // Go to transaction confirmation screen
      navigateTo('TransactionConfirmation', { paymentLink: desktopShareLink, action: ACTION_SEND })
    } catch (e) {
      log.error('Something went wrong while trying to generate send link', e.message, e, { dialogShown: true })
      showErrorDialog('Could not complete transaction. Please try again.')
    }
  }, [amount, counterPartyDisplayName, fullName, navigateTo])

  /**
   * Generates link to send and call send email/sms action
   * @throws Error if link cannot be send
   */
  const getLink = useCallback(() => {
    if (link) {
      return link
    }

    let txHash

    // Generate link deposit
    const generatePaymentLinkResponse = goodWallet.generatePaymentLink(amount, reason, inviteCode, {
      onTransactionHash: hash => {
        txHash = hash

        // Save transaction
        const transactionEvent: TransactionEvent = {
          id: hash,
          date: new Date().toString(),
          createdDate: new Date().toString(),
          type: 'send',
          status: 'pending',
          data: {
            counterPartyDisplayName,
            reason,
            amount,
            paymentLink: generatePaymentLinkResponse.paymentLink,
            hashedCode: generatePaymentLinkResponse.hashedCode,
            code: generatePaymentLinkResponse.code,
          },
        }

        fireEvent('SEND_DONE', { type: 'link' })

        log.debug('generatePaymentLinkAndSend: enqueueTX', { transactionEvent })

        userStorage.enqueueTX(transactionEvent)

        if (Config.isEToro) {
          userStorage.saveSurveyDetails(hash, {
            reason,
            amount,
            survey,
          })
        }
      },
      onError: () => {
        userStorage.markWithErrorEvent(txHash)
      },
    })

    log.debug('generatePaymentLinkAndSend:', { generatePaymentLinkResponse })

    if (generatePaymentLinkResponse) {
      const { txPromise, paymentLink } = generatePaymentLinkResponse

      txPromise.catch(e => {
        log.error('generatePaymentLinkAndSend:', e.message, e, {
          category: ExceptionCategory.Blockhain,
          dialogShown: true,
        })

        showErrorDialog('Link generation failed. Please try again', '', {
          buttons: [
            {
              text: 'Try again',
              onPress: () => {
                hideDialog()

                //this is async so we go directly back to screen and not through stack
                navigateTo('SendLinkSummary', {
                  amount,
                  reason,
                  counterPartyDisplayName,
                  nextRoutes: ['TransactionConfirmation'],
                })
              },
            },
          ],
          onDismiss: () => {
            goToRoot()
          },
        })
      })

      setLink(paymentLink)
      return paymentLink
    }
  }, [survey, showErrorDialog, setLink, link, goToRoot, navigateTo])

  return (
    <SummaryGeneric
      screenProps={screenProps}
      onConfirm={handleConfirm}
      address={address}
      recipient={counterPartyDisplayName}
      amount={amount}
      reason={reason}
      iconName="send"
      title="YOU ARE SENDING"
      action="send"
    />
  )
}

SendLinkSummary.navigationOptions = {
  title: SEND_TITLE,
}

SendLinkSummary.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
  return (
    screenState.amount && (!!screenState.nextRoutes || screenState.address || screenState.sendLink || screenState.from)
  )
}

export default SendLinkSummary
