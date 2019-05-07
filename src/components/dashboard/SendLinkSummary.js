// @flow
import React from 'react'
import { View } from 'react-native'

import UserStorage, { type TransactionEvent } from '../../lib/gundb/UserStorage'
import logger from '../../lib/logger/pino-logger'
import GDStore from '../../lib/undux/GDStore'
import { useWrappedGoodWallet } from '../../lib/wallet/useWrappedWallet'
import { BackButton, useScreenState } from '../appNavigation/stackNavigation'
import { Avatar, BigGoodDollar, CustomButton, Section, Wrapper } from '../common'
import TopBar from '../common/TopBar'
import { receiveStyles } from './styles'

const log = logger.child({ from: 'SendLinkSummary' })

export type AmountProps = {
  screenProps: any,
  navigation: any
}

const TITLE = 'Send GD'

const SendLinkSummary = (props: AmountProps) => {
  const { screenProps } = props
  const [screenState] = useScreenState(screenProps)
  const goodWallet = useWrappedGoodWallet()
  const store = GDStore.useStore()
  const { loading } = store.get('currentScreen')

  const { amount, reason, to } = screenState

  /**
   * Generates link to send and call send email/sms action
   * @throws Error if link cannot be send
   */
  const generateLinkAndSend = async () => {
    try {
      // Generate link deposit
      const generateLinkResponse = await goodWallet.generateLink(amount, reason, {
        onTransactionHash: extraData => hash => {
          // Save transaction
          const transactionEvent: TransactionEvent = {
            id: hash,
            date: new Date().toString(),
            type: 'send',
            data: {
              to,
              reason,
              amount,
              ...extraData
            }
          }
          UserStorage.updateFeedEvent(transactionEvent)
        }
      })

      if (generateLinkResponse) {
        try {
          // Generate link deposit
          const { sendLink } = generateLinkResponse
          // Show confirmation
          screenProps.push('SendConfirmation', { sendLink, amount, reason, to })
        } catch (e) {
          const { hashedString } = generateLinkResponse
          await goodWallet.cancelOtl(hashedString)
          throw e
        }
      }
    } catch (e) {
      log.error(e)
    }
  }

  return (
    <Wrapper style={styles.wrapper}>
      <TopBar push={screenProps.push} />
      <Section style={styles.section}>
        <Section.Row style={styles.sectionRow}>
          <Section.Title style={styles.headline}>Summary</Section.Title>
          <View style={styles.sectionTo}>
            <Avatar size={90} />
            {to && <Section.Text style={styles.toText}>{`To: ${to}`}</Section.Text>}
          </View>
          <Section.Text>
            {`Here's `}
            <BigGoodDollar number={amount} />
          </Section.Text>
          <Section.Text>{reason && `For ${reason}`}</Section.Text>
          <View style={styles.buttonGroup}>
            <BackButton mode="text" screenProps={screenProps} style={{ flex: 1 }}>
              Cancel
            </BackButton>
            <CustomButton mode="contained" onPress={generateLinkAndSend} style={{ flex: 2 }} loading={loading}>
              Next
            </CustomButton>
          </View>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

const styles = {
  ...receiveStyles,
  headline: {
    textTransform: 'uppercase'
  },
  sectionTo: {
    alignItems: 'center'
  },
  toText: {
    marginTop: '1rem',
    marginBottom: '1rem'
  }
}

SendLinkSummary.navigationOptions = {
  title: TITLE
}

SendLinkSummary.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
  return (!!screenState.nextRoutes && screenState.amount) || !!screenState.sendLink
}

export default SendLinkSummary
