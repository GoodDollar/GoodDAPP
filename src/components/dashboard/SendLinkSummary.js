// @flow
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { isMobile } from 'mobile-device-detect'
import { fireEvent } from '../../lib/analytics/analytics'
import GDStore from '../../lib/undux/GDStore'
import { generateSendShareObject, generateSendShareText } from '../../lib/share'
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
import { SEND_TITLE } from './utils/sendReceiveFlow'
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
  const profile = GDStore.useStore().get('profile')
  const [screenState] = useScreenState(screenProps)
  const [showDialog, , showErrorDialog] = useDialog()

  const [isCitizen, setIsCitizen] = useState(GDStore.useStore().get('isLoggedInCitizen'))
  const [shared, setShared] = useState(false)
  const [survey, setSurvey] = useState('other')
  const [link, setLink] = useState('')
  const { amount, reason = null, counterPartyDisplayName } = screenState

  const faceRecognition = () => {
    return screenProps.push('FRIntro', { from: 'SendLinkSummary' })
  }

  const shareAction = async paymentLink => {
    const share = generateSendShareObject(paymentLink, amount, counterPartyDisplayName, profile.fullName)
    try {
      await navigator.share(share)
      setShared(true)
    } catch (e) {
      if (e.name !== 'AbortError') {
        showDialog({
          title: 'There was a problem triggering share action.',
          message: `You can still copy the link by tapping on "Copy link to clipboard".`,
          dismissText: 'Ok',
          onDismiss: () => {
            const desktopShareLink = generateSendShareText(
              paymentLink,
              amount,
              counterPartyDisplayName,
              profile.fullName
            )

            screenProps.push('SendConfirmation', {
              paymentLink: desktopShareLink,
              amount,
              reason,
              counterPartyDisplayName,
            })
          },
        })
      }
    }
  }

  // Going to root after shared
  useEffect(() => {
    if (shared) {
      screenProps.goToRoot()
    }
  }, [shared])

  const handleConfirm = () => {
    let paymentLink = link

    // Prevents calling back `generateLink` as it generates a new transaction every time it's called
    if (paymentLink === '') {
      paymentLink = generateLink()
      setLink(paymentLink)
    }

    if (isMobile && navigator.share) {
      shareAction(paymentLink)
    } else {
      const desktopShareLink = generateSendShareText(paymentLink, amount, counterPartyDisplayName, profile.fullName)

      // Show confirmation
      screenProps.push('SendConfirmation', {
        paymentLink: desktopShareLink,
        amount,
        reason,
        counterPartyDisplayName,
      })
    }
  }

  /**
   * Generates link to send and call send email/sms action
   * @throws Error if link cannot be send
   */
  const generateLink = () => {
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
        const { paymentLink } = generateLinkResponse
        return paymentLink
      }

      showErrorDialog('Could not complete transaction. Please try again.')
    } catch (e) {
      showErrorDialog('Could not complete transaction. Please try again.')
      log.error(e.message, e)
    }
  }

  useEffect(() => {
    if (isCitizen === false) {
      goodWallet.isCitizen().then(setIsCitizen)
    }
  }, [])

  return (
    <Wrapper>
      <TopBar push={screenProps.push} />
      <Section grow style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Section.Stack>
          <Section.Row justifyContent="center">
            <View style={styles.sendIconWrapper}>
              <Icon name="send" size={45} color="white" />
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
          <Section.Row style={[styles.toForTextWrapper, reason ? styles.sendToTextWrapper : undefined]}>
            <Section.Text color="gray80Percent" fontSize={14} style={styles.sendToLabel}>
              To
            </Section.Text>
            <Section.Title fontWeight="medium" lineHeight={24} style={styles.sendToText}>
              {counterPartyDisplayName}
            </Section.Title>
          </Section.Row>
          {reason && (
            <Section.Row style={styles.toForTextWrapper}>
              <Section.Text color="gray80Percent" fontSize={14} style={styles.sendToLabel}>
                For
              </Section.Text>
              <Section.Text fontSize={14} numberOfLines={2} ellipsizeMode="tail" style={styles.reasonText}>
                {reason}
              </Section.Text>
            </Section.Row>
          )}
        </Section.Stack>
        <Section.Row justifyContent="center">
          <Section.Text color="gray80Percent">{'* the transaction may take\na few seconds to complete'}</Section.Text>
        </Section.Row>
        <Section.Row>
          <Section.Row grow={1} justifyContent="flex-start">
            <BackButton mode="text" screenProps={screenProps}>
              Cancel
            </BackButton>
          </Section.Row>
          <Section.Stack grow={3}>
            <CustomButton onPress={isCitizen ? handleConfirm : faceRecognition} disabled={isCitizen === undefined}>
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
  sendIconWrapper: {
    height: getDesignRelativeHeight(75),
    width: getDesignRelativeHeight(75),
    backgroundColor: theme.colors.red,
    position: 'relative',
    borderRadius: '50%',
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
  toForTextWrapper: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.colors.gray50Percent,
    borderRadius: 25,
    height: getDesignRelativeHeight(42),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingBottom: getDesignRelativeHeight(3),
    position: 'relative',
  },
  sendToText: {
    margin: 0,
  },
  sendToLabel: {
    position: 'absolute',
    top: -getDesignRelativeHeight(12),
    backgroundColor: theme.colors.white,
    paddingHorizontal: getDesignRelativeHeight(10),
  },
  sendToTextWrapper: {
    marginBottom: 30,
  },
})

export default withStyles(getStylesFromProps)(SendLinkSummary)
