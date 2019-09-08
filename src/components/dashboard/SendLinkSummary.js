// @flow
import React, { useEffect, useState } from 'react'
import { isMobile } from 'mobile-device-detect'
import GDStore from '../../lib/undux/GDStore'
import { generateSendShareObject } from '../../lib/share'
import userStorage, { type TransactionEvent } from '../../lib/gundb/UserStorage'
import logger from '../../lib/logger/pino-logger'
import { useDialog } from '../../lib/undux/utils/dialog'
import goodWallet from '../../lib/wallet/GoodWallet'
import { BackButton, useScreenState } from '../appNavigation/stackNavigation'
import { CustomButton, Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import SummaryTable from '../common/view/SummaryTable'
import { SEND_TITLE } from './utils/sendReceiveFlow'

const log = logger.child({ from: 'SendLinkSummary' })

export type AmountProps = {
  screenProps: any,
  navigation: any,
}

/**
 * Screen that shows transaction summary for a send link action
 * @param {AmountProps} props
 * @param {any} props.screenProps
 * @param {any} props.navigation
 */
const SendLinkSummary = ({ screenProps }: AmountProps) => {
  const profile = GDStore.useStore().get('profile')
  const [screenState] = useScreenState(screenProps)
  const [showDialog, , showErrorDialog] = useDialog()

  const [isCitizen, setIsCitizen] = useState(GDStore.useStore().get('isLoggedInCitizen'))
  const [shared, setShared] = useState(false)
  const [link, setLink] = useState('')
  const { amount, reason, counterPartyDisplayName } = screenState

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
          message: `You can still copy the link in tapping on "Copy link to clipboard".\n Error ${e.name}: ${
            e.message
          }`,
          dismissText: 'Ok',
          onDismiss: () =>
            screenProps.push('SendConfirmation', {
              paymentLink,
              amount,
              reason,
              counterPartyDisplayName,
            }),
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
      // Show confirmation
      screenProps.push('SendConfirmation', {
        paymentLink,
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
      // Generate link deposit
      const generateLinkResponse = goodWallet.generateLink(
        amount,
        reason,
        ({ paymentLink, code }) => (hash: string) => {
          log.debug({ hash })

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
              paymentLink,
              code,
            },
          }
          log.debug('generateLinkAndSend: enqueueTX', { transactionEvent })
          userStorage.enqueueTX(transactionEvent)
        },
        { onError: userStorage.markWithErrorEvent }
      )
      log.debug('generateLinkAndSend:', { generateLinkResponse })
      if (generateLinkResponse) {
        const { paymentLink } = generateLinkResponse
        return paymentLink
      }
      showErrorDialog('Generating payment failed', 'Unknown Error')
    } catch (e) {
      showErrorDialog('Generating payment failed', e)
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
      <Section grow>
        <Section.Title>SUMMARY</Section.Title>
        <Section.Row justifyContent="center">
          <Section.Text color="gray80Percent">{'* the transaction may take\na few seconds to complete'}</Section.Text>
        </Section.Row>
        <SummaryTable counterPartyDisplayName={counterPartyDisplayName} amount={amount} reason={reason} />
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

export default SendLinkSummary
