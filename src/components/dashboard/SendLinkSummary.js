// @flow
import React, { useEffect, useState } from 'react'
import { isMobile } from 'mobile-device-detect'

import { generateSendShareObject } from '../../lib/share'
import userStorage, { type TransactionEvent } from '../../lib/gundb/UserStorage'
import logger from '../../lib/logger/pino-logger'
import { useDialog } from '../../lib/undux/utils/dialog'
import goodWallet from '../../lib/wallet/GoodWallet'
import { BackButton, useScreenState } from '../appNavigation/stackNavigation'
import { CustomButton, Section, TopBar, Wrapper } from '../common'
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
const SendLinkSummary = (props: AmountProps) => {
  const { screenProps } = props
  const [screenState] = useScreenState(screenProps)
  const [showDialog, , showErrorDialog] = useDialog()
  const [loading, setLoading] = useState(false)
  const [isValid, setIsValid] = useState(screenState.isValid)
  const { amount, reason, counterPartyDisplayName } = screenState

  const faceRecognition = () => {
    return screenProps.push('FRIntro', { from: 'SendLinkSummary' })
  }

  const shareAction = async paymentLink => {
    const share = generateSendShareObject(paymentLink)
    try {
      await navigator.share(share)
    } catch (e) {
      showDialog({
        visible: true,
        title: 'Error',
        message:
          'There was a problem triggering share action. You can still copy the link in tapping on "Copy link to clipboard"',
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

  const doConfirm = paymentLink => {
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
  const generateLinkAndSend = async () => {
    try {
      // Generate link deposit
      const generateLinkResponse = await goodWallet
        .generateLink(amount, reason, ({ paymentLink, code }) => (hash: string) => {
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
        })
        .catch(e => showErrorDialog('Generating payment failed', e))
      log.debug('generateLinkAndSend:', { generateLinkResponse })
      if (generateLinkResponse) {
        try {
          // Generate link deposit
          const { paymentLink } = generateLinkResponse

          doConfirm(paymentLink)
        } catch (e) {
          log.error(e)
          showErrorDialog('Generating payment failed', e)
          const { code } = generateLinkResponse
          await goodWallet.cancelOtl(code)
        }
      } else {
        showErrorDialog('Generating payment failed', 'Unknown Error')
      }
    } catch (e) {
      showErrorDialog('Generating payment failed', e)
      log.error(e)
    }
  }

  const handleContinue = async () => {
    setLoading(true)

    const isCitizen = await goodWallet.isCitizen()

    if (isCitizen) {
      await generateLinkAndSend()
      setLoading(false)
    } else {
      faceRecognition()
    }
  }

  useEffect(() => {
    if (isValid === true) {
      generateLinkAndSend()
    } else if (isValid === false) {
      screenProps.goToRoot()
    }
    return () => setIsValid(undefined)
  }, [isValid])

  return (
    <Wrapper>
      <TopBar push={screenProps.push} />
      <Section grow>
        <Section.Title>SUMMARY</Section.Title>
        <SummaryTable counterPartyDisplayName={counterPartyDisplayName} amount={amount} reason={reason} />
        <Section.Row>
          <Section.Stack grow={1}>
            <BackButton mode="text" screenProps={screenProps}>
              Cancel
            </BackButton>
          </Section.Stack>
          <Section.Stack grow={2}>
            <CustomButton onPress={handleContinue} disabled={loading}>
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
