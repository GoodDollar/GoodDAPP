// @flow

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { get } from 'lodash'
import { text } from 'react-native-communications'
import { t } from '@lingui/macro'
import { fireEvent, SEND_DONE } from '../../lib/analytics/analytics'
import { type TransactionEvent } from '../../lib/userStorage/UserStorageClass'
import { FeedItemType } from '../../lib/userStorage/FeedStorage'
import logger from '../../lib/logger/js-logger'
import { ExceptionCategory } from '../../lib/exceptions/utils'
import { useDialog } from '../../lib/dialog/useDialog'
import { useUserStorage, useWallet } from '../../lib/wallet/GoodWalletProvider'
import { retry } from '../../lib/utils/async'
import API from '../../lib/API'

import { generateSendShareObject, generateSendShareText } from '../../lib/share'
import useProfile from '../../lib/userStorage/useProfile'
import { useScreenState } from '../appNavigation/stackNavigation'
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
  const userStorage = useUserStorage()
  const inviteCode = userStorage.userProperties.get('inviteCode')
  const [screenState] = useScreenState(screenProps)
  const { showDialog, hideDialog, showErrorDialog } = useDialog()

  const [shared, setShared] = useState(false)
  const [link, setLink] = useState('')

  const goodWallet = useWallet()

  const { goToRoot, navigateTo } = screenProps
  const { fullName } = useProfile()
  const vendorFieldsRef = useRef({})

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
          const { current: vendorFields } = vendorFieldsRef

          // Save transaction
          const transactionEvent: TransactionEvent = {
            id: hash,
            date: new Date().toISOString(),
            createdDate: new Date().toISOString(),
            type: FeedItemType.EVENT_TYPE_SEND,
            status: 'pending',
            data: {
              counterPartyDisplayName,
              senderEmail: vendorFields.email,
              senderName: vendorFields.name,
              reason,
              category,
              amount,
              paymentLink: generatePaymentLinkResponse.paymentLink,
              hashedCode: generatePaymentLinkResponse.hashedCode,
              code: generatePaymentLinkResponse.code,
            },
          }

          fireEvent(SEND_DONE, { type: 'link' })

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

          showErrorDialog(t`Link generation failed. Please try again`, '', {
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
    [
      amount,
      reason,
      category,
      inviteCode,
      showErrorDialog,
      setLink,
      link,
      goToRoot,
      navigateTo,
      goodWallet,
      userStorage,
    ],
  )

  const sendViaAddress = useCallback(
    async to => {
      try {
        let txhash

        await goodWallet.sendAmountWithData(to, amount, get(vendorInfo, 'data', get(vendorInfo, 'invoiceId')), {
          onTransactionHash: hash => {
            log.debug('Send G$ to address', { hash })
            txhash = hash

            const { current: vendorFields } = vendorFieldsRef

            // integrate with vendors callback, notifying payment has been made
            retry(() =>
              API.notifyVendor(txhash, {
                ...vendorInfo,
                senderEmail: vendorFields.email,
                senderName: vendorFields.name,
              }),
            ).catch(e => log.error('failed notifying vendor callback', e.message, e, { vendorInfo }))

            // Save transaction
            const transactionEvent: TransactionEvent = {
              id: hash,
              createdDate: new Date().toISOString(),
              date: new Date().toISOString(),
              type: FeedItemType.EVENT_TYPE_SENDDIRECT,
              data: {
                to: address,
                reason,
                category,
                amount,
                senderEmail: vendorFields.email,
                senderName: vendorFields.name,
                invoiceId: vendorInfo?.invoiceId,
                sellerWebsite: vendorInfo?.website,
                sellerName: vendorInfo?.vendorName,
              },
            }

            log.debug('sendViaAddress: enqueueTX', { transactionEvent })

            userStorage.enqueueTX(transactionEvent)

            fireEvent(SEND_DONE, { type: get(screenState, 'params.type', contact ? 'contact' : 'Address') }) //type can be QR, receive, contact, contactsms

            showDialog({
              visible: true,
              title: t`SUCCESS!`,
              message: t`The G$ was sent successfully`,
              buttons: [{ text: t`Yay!` }],
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
          title: t`Transaction Failed!`,
          message: t`There was a problem sending G$. Check payment details.`,
          dismissText: t`OK`,
        })
      }
    },
    [address, amount, reason, showDialog, showErrorDialog, goToRoot, goodWallet, userStorage],
  )

  const sendViaLink = useCallback(() => {
    try {
      const paymentLink = getLink()
      const desktopShareLink = generateSendShareObject(paymentLink, amount, counterPartyDisplayName, fullName)

      // Go to transaction confirmation screen
      navigateTo('TransactionConfirmation', { paymentLink: desktopShareLink, action: ACTION_SEND })
    } catch (e) {
      log.error('Something went wrong while trying to generate send link', e.message, e, { dialogShown: true })
      showErrorDialog(t`Could not complete transaction. Please try again.`)
    }
  }, [amount, counterPartyDisplayName, fullName, navigateTo, getLink])

  const handlePayment = useCallback(async () => {
    let paymentLink = link
    let walletAddress
    const { phoneNumber } = contact || ''

    if (phoneNumber) {
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '')

      walletAddress = await userStorage.getUserAddress(cleanPhoneNumber)
    }

    if (phoneNumber) {
      if (walletAddress) {
        sendViaAddress(walletAddress)
      } else {
        const link = paymentLink || getLink('contactsms')
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
    userStorage,
  ])

  const handleConfirm = useCallback(
    async vendorFields => {
      // store fields received from the summary compomnent to the ref
      // for access them immediately from the nested handlers
      vendorFieldsRef.current = vendorFields || {}

      if (action === ACTION_SEND_TO_ADDRESS) {
        await sendViaAddress(address)
      } else {
        handlePayment()
      }
    },
    [action, handlePayment, sendViaAddress, address],
  )

  return (
    <SummaryGeneric
      screenProps={screenProps}
      onConfirm={handleConfirm}
      address={address}
      recipient={counterPartyDisplayName}
      amount={amount}
      reason={reason}
      iconName="send"
      title={t`YOU ARE SENDING`}
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
