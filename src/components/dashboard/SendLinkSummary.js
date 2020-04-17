// @flow
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Platform, Share, View } from 'react-native'
import useNativeSharing from '../../lib/hooks/useNativeSharing'
import { fireEvent } from '../../lib/analytics/analytics'
import GDStore from '../../lib/undux/GDStore'
import Config from '../../config/config'
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
import { ACTION_SEND_TO_ADDRESS, SEND_TITLE } from './utils/sendReceiveFlow'
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
  const [screenState] = useScreenState(screenProps)
  const [showDialog, , showErrorDialog] = useDialog()
  const { canShare, generateSendShareObject, generateSendShareText } = useNativeSharing()

  const { push, goToRoot } = screenProps

  const { fullName } = gdstore.get('profile')
  const { amount, reason = null, counterPartyDisplayName, address, params = {} } = screenState
  const { action } = params

  const [isCitizen, setIsCitizen] = useState(gdstore.get('isLoggedInCitizen'))
  const [shared, setShared] = useState(false)
  const [survey, setSurvey] = useState('other')
  const [link, setLink] = useState('')
  const [loading, setLoading] = useState('')

  const faceRecognition = useCallback(() => {
    return screenProps.push('FaceVerificationIntro', { from: 'SendLinkSummary' })
  }, [screenProps])

  const shareStringStateDepSource = [amount, counterPartyDisplayName, fullName]

  const shareAction = useCallback(
    async paymentLink => {
      const shareStringSource = [paymentLink, ...shareStringStateDepSource]
      const shareString = generateSendShareObject(...shareStringSource)

      try {
        await Share.share(shareString)

        //on non web we have the send confirmation which is skipped here, so we simulate the events
        //so we have same funnel for mobile + web
        fireEvent('SEND_CONFIRMATION', { type: 'link' })
        fireEvent('SEND_CONFIRMATION_SHARE', { type: 'share' })

        setShared(true)
      } catch (e) {
        if (e.name !== 'AbortError') {
          showDialog({
            title: 'There was a problem triggering share action.',
            message: `You can still copy the link by tapping on "Copy link to clipboard".`,
            dismissText: 'Ok',
            onDismiss: () => {
              const desktopShareLink = generateSendShareText(...shareStringSource)

              push('TransactionConfirmation', {
                paymentLink: desktopShareLink,
              })
            },
          })
        }
      }
    },
    [...shareStringStateDepSource, generateSendShareText, generateSendShareObject, setShared, showDialog, push]
  )

  const handleConfirm = useCallback(() => {
    if (action === ACTION_SEND_TO_ADDRESS) {
      sendViaAddress()
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
    let paymentLink = getLink()

    if (canShare) {
      shareAction(paymentLink)
    } else {
      const desktopShareLink = generateSendShareText(paymentLink, ...shareStringStateDepSource)

      // Show confirmation
      push('TransactionConfirmation', { paymentLink: desktopShareLink })
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

    try {
      let txHash

      // Generate link deposit
      const generateLinkResponse = goodWallet.generateLink(amount, reason, {
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
              paymentLink: generateLinkResponse.paymentLink,
              hashedCode: generateLinkResponse.hashedCode,
              code: generateLinkResponse.code,
            },
          }

          fireEvent('SEND_DONE', { type: 'link' })

          log.debug('generateLinkAndSend: enqueueTX', { transactionEvent })

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

      log.debug('generateLinkAndSend:', { generateLinkResponse })

      if (generateLinkResponse) {
        const { txPromise, paymentLink } = generateLinkResponse

        txPromise.catch(e => {
          log.error('generateLinkAndSend:', e.message, e)
          showErrorDialog('Link generation failed. Please try again', '', {
            buttons: [
              {
                text: 'Try again',
                onPress: () => {
                  handleConfirm()
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

      showErrorDialog('Could not complete transaction. Please try again.')
    } catch (e) {
      showErrorDialog('Could not complete transaction. Please try again.')
      log.error('Something went wrong while trying to generate send link', e.message, e)
    }
  }, [amount, reason, counterPartyDisplayName, survey, showErrorDialog, setLink, link, goToRoot])

  const onConfirmPressHandler = useMemo(() => (isCitizen ? handleConfirm : faceRecognition), [isCitizen])

  useEffect(() => {
    if (isCitizen === false) {
      goodWallet.isCitizen().then(setIsCitizen)
    }
  }, [])

  // Going to root after shared
  useEffect(() => {
    if (shared) {
      goToRoot()
    }
  }, [shared])

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
                lineHeight: 24,
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
          {reason && (
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
            <CustomButton onPress={onConfirmPressHandler} disabled={isCitizen === undefined} lodaing={loading}>
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
