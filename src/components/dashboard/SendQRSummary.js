// @flow
/**
 * @file Displays a summary when sending G$ directly to a blockchain address
 */
import React, { useEffect, useState } from 'react'
import { fireEvent, SEND_DONE } from '../../lib/analytics/analytics'
import { type TransactionEvent } from '../../lib/userStorage/UserStorageClass'
import logger from '../../lib/logger/js-logger'
import { ExceptionCategory } from '../../lib/exceptions/utils'
import { useDialog } from '../../lib/dialog/useDialog'
import { useWrappedGoodWallet } from '../../lib/wallet/useWrappedWallet'
import { useUserStorage } from '../../lib/wallet/GoodWalletProvider'

import { BackButton, useScreenState } from '../appNavigation/stackNavigation'
import { CustomButton, Section, Wrapper } from '../common'
import SummaryTable from '../common/view/SummaryTable'
import TopBar from '../common/view/TopBar'
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
const SendQRSummary = ({ screenProps }: AmountProps, params) => {
  const [screenState] = useScreenState(screenProps)
  const goodWallet = useWrappedGoodWallet()
  const userStorage = useUserStorage()

  const { showDialog, showErrorDialog } = useDialog()
  const [loading, setLoading] = useState(false)
  const [isValid, setIsValid] = useState(screenState.isValid)
  const { amount, reason, to } = screenState
  const [profile, setProfile] = useState({})

  const updateRecepientProfile = async () => {
    const profile = await userStorage.getPublicProfile(to)

    setProfile(profile)
  }

  const confirm = () => {
    try {
      sendGD()
    } catch (e) {
      log.error('Send TX failed:', e.message, e, { dialogShown: true })
      showErrorDialog({
        visible: true,
        title: 'Transaction Failed!',
        message: `There was a problem sending G$. Try again`,
        dismissText: 'OK',
        onDismiss: () => {
          confirm()
        },
      })
    }
  }

  useEffect(() => {
    if (to) {
      updateRecepientProfile()
    }
  }, [to])

  const sendGD = () => {
    try {
      setLoading(true)

      let txhash

      goodWallet.sendAmount(to, amount, {
        onTransactionHash: hash => {
          log.debug({ hash })
          txhash = hash

          // Save transaction
          const transactionEvent: TransactionEvent = {
            id: hash,
            createdDate: new Date().toISOString(),
            date: new Date().toISOString(),
            type: 'send',
            data: {
              to,
              reason,
              amount,
            },
          }

          userStorage.enqueueTX(transactionEvent)

          fireEvent(SEND_DONE, { type: screenState.params.type })
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
          log.error('Send TX failed:', e.message, e, { category: ExceptionCategory.Blockhain })

          setLoading(false)
          userStorage.markWithErrorEvent(txhash)
        },
      })
    } catch (e) {
      log.error('Send TX failed:', e.message, e, { category: ExceptionCategory.Blockhain })

      showErrorDialog({
        visible: true,
        title: 'Transaction Failed!',
        message: `There was a problem sending G$. Try again`,
        dismissText: 'OK',
      })
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
        <SummaryTable counterPartyDisplayName={profile.fullName || to} amount={amount} reason={reason} />
        <Section.Row>
          <Section.Row grow={1} justifyContent="flex-start">
            <BackButton mode="text" screenProps={screenProps}>
              Cancel
            </BackButton>
          </Section.Row>
          <Section.Stack grow={3}>
            <CustomButton mode="contained" onPress={confirm} loading={loading}>
              Confirm
            </CustomButton>
          </Section.Stack>
        </Section.Row>
      </Section>
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
