// @flow
import React, { useCallback, useEffect, useState } from 'react'
import { Platform, View } from 'react-native'
import { text } from 'react-native-communications'
import useNativeSharing from '../../lib/hooks/useNativeSharing'
import { fireEvent } from '../../lib/analytics/analytics'
import GDStore from '../../lib/undux/GDStore'
import Config from '../../config/config'
import gun from '../../lib/gundb/gundb'
import userStorage, { type TransactionEvent } from '../../lib/gundb/UserStorage'
import logger from '../../lib/logger/pino-logger'
import { useDialog } from '../../lib/undux/utils/dialog'
import goodWallet from '../../lib/wallet/GoodWallet'
import { BackButton, useScreenState } from '../appNavigation/stackNavigation'
import { BigGoodDollar, CustomButton, Icon, Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import { withStyles } from '../../lib/styles'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import normalize from '../../lib/utils/normalizeText'
import { ACTION_SEND, ACTION_SEND_TO_ADDRESS, SEND_TITLE } from './utils/sendReceiveFlow'
import SurveySend from './SurveySend'

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
  const inviteCode = gdstore.get('inviteCode')
  const [screenState] = useScreenState(screenProps)
  const [showDialog, hideDialog, showErrorDialog] = useDialog()
  const { canShare, generateSendShareObject, generateSendShareText } = useNativeSharing()
  const [loading, setLoading] = useState(false)

  const { push, goToRoot } = screenProps
  const [shared, setShared] = useState(false)
  const [survey, setSurvey] = useState('other')
  const [link, setLink] = useState('')
  const { amount, reason = null, counterPartyDisplayName, contact, address, params = {} } = screenState

  const { fullName } = gdstore.get('profile')
  const { action } = params

  const shareStringStateDepSource = [amount, counterPartyDisplayName, fullName]

  const handleConfirm = useCallback(() => {
    if (action === ACTION_SEND_TO_ADDRESS) {
      sendViaAddress()
    } else {
      handlePayment()
    }
  }, [
    generateSendShareText,
    generateSendShareObject,
    amount,
    reason,
    counterPartyDisplayName,
    setShared,
    showDialog,
    screenProps,
  ])

  const sendPayment = to => {
    try {
      setLoading(true)
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

          fireEvent('SEND_DONE', { type: screenState.params.type })
          showDialog({
            visible: true,
            title: 'SUCCESS!',
            message: 'The G$ was sent successfully',
            buttons: [{ text: 'Yay!' }],
            onDismiss: setShared(true),
          })
          setLoading(false)
          return hash
        },
        onError: e => {
          log.error('Send TX failed:', e.message, e)
          setLoading(false)
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

  const searchWalletAddress = async phoneNumber => {
    const walletAddress = await gun
      .get('users/bymobile')
      .get(phoneNumber)
      .get('profile')
      .get('walletAddress')
      .get('display')
    return walletAddress
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
      walletAddress = await searchWalletAddress(cleanPhoneNumber)
    }

    if (phoneNumber) {
      if (walletAddress) {
        sendPayment(walletAddress)
      } else {
        const link = paymentLink ? paymentLink : getLink()
        const shareLink = generateSendShareText(link, ...shareStringStateDepSource)
        text(contact.phoneNumber, shareLink)
        setShared(true)
      }
    } else {
      sendViaLink()
    }
  }, [action])

  const sendViaAddress = useCallback(() => {
    try {
      setLoading(true)
      let txhash
      goodWallet.sendAmount(address, amount, {
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

          fireEvent('SEND_DONE', { type: 'Address' })

          showDialog({
            visible: true,
            title: 'SUCCESS!',
            message: 'The G$ was sent successfully',
            buttons: [{ text: 'Yay!' }],
            onDismiss: screenProps.goToRoot,
          })

          setLoading(false)

          return hash
        },
        onError: e => {
          log.error('Send TX failed:', e.message, e)

          setLoading(false)
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
  }, [setLoading, address, amount, reason, showDialog, showErrorDialog])

  const sendViaLink = useCallback(() => {
    try {
      const paymentLink = getLink()

      const desktopShareLink = (canShare ? generateSendShareObject : generateSendShareText)(
        paymentLink,
        ...shareStringStateDepSource,
      )

      // Go to transaction confirmation screen
      push('TransactionConfirmation', { paymentLink: desktopShareLink, action: ACTION_SEND })
    } catch (e) {
      showErrorDialog('Could not complete transaction. Please try again.')
      log.error('Something went wrong while trying to generate send link', e.message, e)
    }
  }, [...shareStringStateDepSource, generateSendShareText, canShare, push])

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
        log.error('generatePaymentLinkAndSend:', e.message, e)

        showErrorDialog('Link generation failed. Please try again', '', {
          buttons: [
            {
              text: 'Try again',
              onPress: () => {
                hideDialog()
                screenProps.navigateTo('SendLinkSummary', { amount, reason, counterPartyDisplayName })
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
  }, [screenProps, survey, showErrorDialog, setLink, link, goToRoot])

  return (
    <Wrapper>
      <TopBar push={push} />
      <Section grow style={styles.section}>
        <Section.Stack>
          <Section.Row justifyContent="center">
            <View style={styles.sendIconWrapper}>
              <Icon name="send" size={getDesignRelativeHeight(45)} color="white" />
            </View>
          </Section.Row>
          <Section.Title fontWeight="medium">YOU ARE SENDING</Section.Title>
          <Section.Title fontWeight="medium" style={styles.amountWrapper}>
            <BigGoodDollar
              number={amount}
              color="red"
              bigNumberProps={{
                fontSize: 36,
                lineHeight: 36,
                fontFamily: 'Roboto Slab',
                fontWeight: 'bold',
              }}
              bigNumberUnitProps={{ fontSize: 14 }}
            />
          </Section.Title>
        </Section.Stack>
        <Section.Stack>
          <Section.Row style={[styles.credsWrapper, reason ? styles.toTextWrapper : undefined]}>
            <Section.Text color="gray80Percent" fontSize={14} style={styles.credsLabel}>
              To
            </Section.Text>
            {address ? (
              <Section.Text fontFamily="Roboto Slab" fontSize={13} lineHeight={21} style={styles.toText}>
                {address}
              </Section.Text>
            ) : (
              <Section.Text fontSize={24} fontWeight="medium" lineHeight={24} style={styles.toText}>
                {counterPartyDisplayName}
              </Section.Text>
            )}
          </Section.Row>
          {!!reason && (
            <Section.Row style={[styles.credsWrapper, styles.reasonWrapper]}>
              <Section.Text color="gray80Percent" fontSize={14} style={styles.credsLabel}>
                For
              </Section.Text>
              <Section.Text fontSize={normalize(14)} numberOfLines={2} ellipsizeMode="tail">
                {reason}
              </Section.Text>
            </Section.Row>
          )}
        </Section.Stack>
        <Section.Row justifyContent="center" style={styles.warnText}>
          <Section.Text color="gray80Percent">{'* the transaction may take\na few seconds to complete'}</Section.Text>
        </Section.Row>
        <Section.Row>
          <Section.Row grow={1} justifyContent="flex-start">
            <BackButton mode="text" screenProps={screenProps}>
              Cancel
            </BackButton>
          </Section.Row>
          <Section.Stack grow={3}>
            <CustomButton onPress={handleConfirm} loading={loading}>
              Confirm
            </CustomButton>
          </Section.Stack>
        </Section.Row>
      </Section>
      <SurveySend handleCheckSurvey={setSurvey} />
    </Wrapper>
  )
}

SendLinkSummary.navigationOptions = {
  title: SEND_TITLE,
}

SendLinkSummary.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
  return (!!screenState.nextRoutes && screenState.amount) || !!screenState.sendLink || screenState.from
}

const getStylesFromProps = ({ theme }) => ({
  section: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  sendIconWrapper: {
    height: getDesignRelativeHeight(75),
    width: getDesignRelativeHeight(75),
    backgroundColor: theme.colors.red,
    position: 'relative',
    borderRadius: Platform.select({
      web: '50%',
      default: getDesignRelativeHeight(75) / 2,
    }),
    marginTop: getDesignRelativeHeight(15),
    marginBottom: getDesignRelativeHeight(24),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: getDesignRelativeHeight(10),
    marginBottom: getDesignRelativeHeight(27),
  },
  credsWrapper: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.colors.gray50Percent,
    borderRadius: 25,
    height: 42,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingBottom: getDesignRelativeHeight(4),
    position: 'relative',
  },
  credsLabel: {
    position: 'absolute',
    top: -getDesignRelativeHeight(10),
    backgroundColor: theme.colors.white,
    paddingHorizontal: getDesignRelativeHeight(10),
    lineHeight: normalize(14),
  },
  toTextWrapper: {
    marginBottom: 24,
  },
  toText: {
    margin: 0,
  },
  reasonWrapper: {
    alignItems: 'center',
    paddingBottom: 0,
  },
  warnText: {
    marginVertical: getDesignRelativeHeight(24),
  },
})

export default withStyles(getStylesFromProps)(SendLinkSummary)
