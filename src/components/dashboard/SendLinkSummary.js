// @flow
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import userStorage, { type TransactionEvent } from '../../lib/gundb/UserStorage'
import logger from '../../lib/logger/pino-logger'
import { useDialog } from '../../lib/undux/utils/dialog'
import goodWallet from '../../lib/wallet/GoodWallet'
import { BackButton, useScreenState } from '../appNavigation/stackNavigation'
import { Avatar, BigGoodDollar, CustomButton, Section, TopBar, Wrapper } from '../common'
import { receiveStyles } from './styles'

const log = logger.child({ from: 'SendLinkSummary' })

export type AmountProps = {
  screenProps: any,
  navigation: any
}

const TITLE = 'Send G$'

/**
 * Screen that shows transaction summary for a send link action
 * @param {AmountProps} props
 * @param {any} props.screenProps
 * @param {any} props.navigation
 */
const SendLinkSummary = (props: AmountProps) => {
  const { screenProps } = props
  const [screenState] = useScreenState(screenProps)
  const [, , showErrorDialog] = useDialog()
  const [loading, setLoading] = useState(false)
  const [isValid, setIsValid] = useState(screenState.isValid)
  const { amount, reason, to } = screenState

  const faceRecognition = () => {
    return screenProps.push('FRIntro', { from: 'SendLinkSummary' })
  }

  /**
   * Generates link to send and call send email/sms action
   * @throws Error if link cannot be send
   */
  const generateLinkAndSend = async () => {
    try {
      // Generate link deposit
      const generateLinkResponse = await goodWallet.generateLink(
        amount,
        reason,
        ({ paymentLink, code }) => (hash: string) => {
          // Save transaction
          const transactionEvent: TransactionEvent = {
            id: hash,
            date: new Date().toString(),
            createdDate: new Date().toString(),
            type: 'send',
            status: 'pending',
            data: {
              to,
              reason,
              amount,
              paymentLink,
              code
            }
          }
          log.debug('generateLinkAndSend: enqueueTX', { transactionEvent })
          userStorage.enqueueTX(transactionEvent)
        }
      )
      log.debug('generateLinkAndSend:', { generateLinkResponse })
      if (generateLinkResponse) {
        try {
          // Generate link deposit
          const { paymentLink } = generateLinkResponse

          // Show confirmation
          screenProps.push('SendConfirmation', { paymentLink, amount, reason, to })
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
    <Wrapper style={styles.wrapper}>
      <TopBar push={screenProps.push} />
      <Section style={styles.section}>
        <Section.Row style={styles.sectionRow}>
          <Section.Title style={styles.headline}>SUMMARY</Section.Title>
          <View style={styles.sectionTo}>
            <Avatar size={110} />
            {to && <Section.Text style={styles.toText}>{`To: ${to}`}</Section.Text>}
          </View>
          <Section.Text style={styles.reason}>
            {`Here's `}
            <BigGoodDollar number={amount} />
          </Section.Text>
          <Section.Text style={styles.reason}>{reason && `For ${reason}`}</Section.Text>
          <View style={styles.buttonGroup}>
            <BackButton mode="text" screenProps={screenProps} style={{ flex: 1 }}>
              Cancel
            </BackButton>
            <CustomButton mode="contained" onPress={handleContinue} style={{ flex: 2 }} disabled={loading}>
              Confirm
            </CustomButton>
          </View>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

const styles = {
  ...receiveStyles,
  sectionTo: {
    alignItems: 'center'
  },
  toText: {
    marginTop: '1rem',
    marginBottom: '1rem'
  },
  reason: {
    fontSize: normalize(16)
  }
}

SendLinkSummary.navigationOptions = {
  title: TITLE
}

SendLinkSummary.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
  return (!!screenState.nextRoutes && screenState.amount) || !!screenState.sendLink || screenState.from
}

export default SendLinkSummary
