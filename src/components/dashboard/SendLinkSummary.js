// @flow

import React, { useCallback, useEffect, useState } from 'react'
import { get } from 'lodash'
import { text } from 'react-native-communications'
import { fireEvent } from '../../lib/analytics/analytics'
import GDStore from '../../lib/undux/GDStore'
import gun from '../../lib/gundb/gundb'
import userStorage, { type TransactionEvent } from '../../lib/gundb/UserStorage'
import { FeedItemType } from '../../lib/gundb/FeedStorage'
import logger from '../../lib/logger/pino-logger'
import { ExceptionCategory } from '../../lib/logger/exceptions'
import { useDialog } from '../../lib/undux/utils/dialog'
import goodWallet from '../../lib/wallet/GoodWallet'
import { retry } from '../../lib/utils/async'
import API from '../../lib/API/api'

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
  const [link, setLink] = useState('')

  const { goToRoot, navigateTo } = screenProps
  const { fullName } = gdstore.get('profile')
  const {
    amount,
    reason = null,
    category = null,
    counterPartyDisplayName,
    contact,
    address,
    action,
    vendorInfo = null,
  } = screenState

  // Going to root after shared
  useEffect(() => {
    if (shared) {
      screenProps.goToRoot()
    }
  }, [shared])

  /**
   * Generates link to send and call send email/sms action
   * @throws Error if link cannot be send
   */
  const getLink = useCallback(
    (eventType = 'link') => {
      if (link) {
        return link
      }

      let txHash

      // Generate link deposit
      const generatePaymentLinkResponse = goodWallet.generatePaymentLink(amount, reason, category, inviteCode, {
        onTransactionHash: hash => {
          txHash = hash

          // Save transaction
          const transactionEvent: TransactionEvent = {
            id: hash,
            date: new Date().toString(),
            createdDate: new Date().toString(),
            type: FeedItemType.EVENT_TYPE_SEND,
            status: 'pending',
            data: {
              counterPartyDisplayName,
              reason,
              category,
              amount,
              paymentLink: generatePaymentLinkResponse.paymentLink,
              hashedCode: generatePaymentLinkResponse.hashedCode,
              code: generatePaymentLinkResponse.code,
            },
          }

          fireEvent('SEND_DONE', { type: 'link' })

          log.debug('generatePaymentLinkAndSend: enqueueTX', { transactionEvent })

          userStorage.enqueueTX(transactionEvent)
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
    },
    [amount, reason, category, inviteCode, showErrorDialog, setLink, link, goToRoot, navigateTo],
  )

  const sendViaAddress = useCallback(
    async to => {
      try {
        let txhash
        await goodWallet.sendAmount(to, amount, {
          onTransactionHash: hash => {
            log.debug('Send G$ to address', { hash })
            txhash = hash

            // integrate with vendors callback, notifying payment has been made
            retry(() =>
              API.notifyVendor(txhash, vendorInfo).catch(e =>
                log.error('failed notifying vendor callback', { vendorInfo }),
              ),
            )

            // Save transaction
            const transactionEvent: TransactionEvent = {
              id: hash,
              date: new Date().toString(),
              type: FeedItemType.EVENT_TYPE_SENDDIRECT,
              data: {
                to: address,
                reason,
                category,
                amount,
              },
            }

            log.debug('sendViaAddress: enqueueTX', { transactionEvent })

            userStorage.enqueueTX(transactionEvent)

            fireEvent('SEND_DONE', { type: get(screenState, 'params.type', contact ? 'contact' : 'Address') }) //type can be QR, receive, contact, contactsms

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
    },
    [address, amount, reason, showDialog, showErrorDialog, goToRoot],
  )

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
  }, [amount, counterPartyDisplayName, fullName, navigateTo, getLink])

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
        sendViaAddress(walletAddress)
      } else {
        const link = paymentLink ? paymentLink : getLink('contactsms')
        const shareLink = generateSendShareText(link, amount, counterPartyDisplayName, fullName)

        text(contact.phoneNumber, shareLink)
        setShared(true)
      }
    } else {
      sendViaLink()
    }
  }, [
    contact,
    link,
    amount,
    counterPartyDisplayName,
    fullName,
    generateSendShareText,
    getLink,
    sendViaLink,
    sendViaAddress,
    setShared,
  ])

  const handleConfirm = useCallback(async () => {
    if (action === ACTION_SEND_TO_ADDRESS) {
      await sendViaAddress(address)
    } else {
      handlePayment()
    }
  }, [action, handlePayment, sendViaAddress, address])

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
      vendorInfo={vendorInfo}
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
