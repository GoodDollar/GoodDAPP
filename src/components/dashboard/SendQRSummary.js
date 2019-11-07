// @flow
/**
 * @file Displays a summary when sending G$ directly to a blockchain address
 */
import React, { useEffect, useState } from 'react'
import userStorage, { type TransactionEvent } from '../../lib/gundb/UserStorage'
import logger from '../../lib/logger/pino-logger'
import { useDialog } from '../../lib/undux/utils/dialog'
import { useWrappedGoodWallet } from '../../lib/wallet/useWrappedWallet'
import { BackButton, useScreenState } from '../appNavigation/stackNavigation'
import { CustomButton, Section, Wrapper } from '../common'
import SummaryTable from '../common/view/SummaryTable'
import TopBar from '../common/view/TopBar'
import Config from '../../config/config'
import SurveySend from './SurveySend'
import { SEND_TITLE } from './utils/sendReceiveFlow'

export type AmountProps = {
  screenProps: any,
  navigation: any,
}

const log = logger.child({ from: 'SendQRSummary' })

/**
 * Screen that shows transaction summary for a send qr action
 * @param {AmountProps} props
 * @param {any} props.screenProps
 * @param {any} props.styles
 */
const SendQRSummary = ({ screenProps }: AmountProps) => {
  const [screenState] = useScreenState(screenProps)
  const goodWallet = useWrappedGoodWallet()
  const [showDialog] = useDialog()
  const [survey, setSurvey] = useState('other')
  const [loading, setLoading] = useState(false)
  const [isValid, setIsValid] = useState(screenState.isValid)
  const { amount, reason, to } = screenState
  const [profile, setProfile] = useState({})

  const updateRecepientProfile = async () => {
    const profile = await userStorage.getUserProfile(to)
    setProfile(profile)
  }

  useEffect(() => {
    if (to) {
      updateRecepientProfile()
    }
  }, [to])

  const faceRecognition = () => {
    return screenProps.push('FRIntro', { from: 'SendQRSummary' })
  }
  const sendGD = () => {
    try {
      setLoading(true)
      goodWallet.sendAmount(to, amount, {
        onTransactionHash: hash => {
          log.debug({ hash })

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

          showDialog({
            visible: true,
            title: 'SUCCESS!',
            message: 'The G$ was sent successfully',
            buttons: [{ text: 'Yay!' }],
            onDismiss: screenProps.goToRoot,
          })
          return hash
        },
        onError: e => {
          log.error('Send TX failed:', e.message, e)
          showDialog({
            visible: true,
            title: 'Transaction Failed!',
            message: `There was a problem sending G$. Try again`,
            dismissText: 'OK',
          })
        },
      })
    } catch (e) {
      log.error('Send TX failed:', e.message, e)
      showDialog({
        visible: true,
        title: 'Transaction Failed!',
        message: `There was a problem sending G$. Try again`,
        dismissText: 'OK',
      })
    } finally {
      setLoading(false)
    }
  }

  // continue after valid FR to send G$
  useEffect(() => {
    if (isValid === true) {
      sendGD()
    } else if (isValid === false) {
      screenProps.goToRoot()
    }
    return () => setIsValid(undefined)
  }, [isValid])

  return (
    <Wrapper>
      <TopBar push={screenProps.push} />
      <Section grow>
        <Section.Title>Summary</Section.Title>
        <Section.Row justifyContent="center">
          <Section.Text color="gray80Percent">{'* the transaction may take\na few seconds to complete'}</Section.Text>
        </Section.Row>
        <SummaryTable counterPartyDisplayName={profile.name} amount={amount} reason={reason} />
        <Section.Row>
          <Section.Row grow={1} justifyContent="flex-start">
            <BackButton mode="text" screenProps={screenProps}>
              Cancel
            </BackButton>
          </Section.Row>
          <Section.Stack grow={3}>
            <CustomButton
              mode="contained"
              onPress={async () => {
                ;(await goodWallet.isCitizen()) ? sendGD() : faceRecognition()
              }}
              loading={loading}
            >
              Confirm
            </CustomButton>
          </Section.Stack>
        </Section.Row>
      </Section>
      <SurveySend handleCheckSurvey={setSurvey} />
    </Wrapper>
  )
}

SendQRSummary.navigationOptions = {
  title: SEND_TITLE,
}

SendQRSummary.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps

  // Component shouldn't be loaded if there's no 'amount', nor 'to' fields with data
  return (!!screenState.amount && !!screenState.to) || screenState.from
}

export default SendQRSummary
