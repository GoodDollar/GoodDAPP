// @flow
import React from 'react'
import { View, Linking } from 'react-native'
import { Text } from 'react-native-elements'
import { useWrappedGoodWallet } from '../../lib/wallet/useWrappedWallet'
import { type TransactionEvent } from '../../lib/gundb/UserStorage'
import UserStorage from '../../lib/gundb/UserStorage'
import { Section, Wrapper, Avatar, BigGoodDollar, CustomButton, CustomDialog } from '../common'
import { BackButton, PushButton, useScreenState } from '../appNavigation/stackNavigation'
import { receiveStyles } from './styles'
import TopBar from '../common/TopBar'
import { useWrappedApi } from '../../lib/API/useWrappedApi'
import isEmail from 'validator/lib/isEmail'
import isMobilePhone from '../../lib/validators/isMobilePhone'
import GDStore from '../../lib/undux/GDStore'
import logger from '../../lib/logger/pino-logger'
import wrapper from '../../lib/undux/utils/wrapper'

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
  const API = useWrappedApi()

  const { amount, reason, to } = screenState

  /**
   * Send link via SMS or Email
   *
   * @param {string} to - Email address or phone number
   * @param {string} sendLink - Link
   * @returns JSON Object with ok if email or sms has been sent
   * @throws Error with invalid email/phone
   */
  const generateHrefLink = (to: string, sendLink: string) => {
    const text = `You got GD. To withdraw open: ${sendLink}`

    if (!to) return

    // Send email if to is email
    if (isEmail(to)) {
      return `mailto:${to}?subject=Sending GD via Good Dollar App&body=${text}`
    }

    // Send sms if to is phone
    if (isMobilePhone(to)) {
      return `sms:${to}?body=${text}`
    }

    throw new Error(`${to} is neither a valid phone or email`)
  }

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
          const { sendLink, receipt } = generateLinkResponse
          const hrefLink = generateHrefLink(to, sendLink)
          log.debug({ sendLink, receipt })
          // Show confirmation
          screenProps.push('SendConfirmation', { sendLink, amount, reason, hrefLink })
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
          <Section.Title style={styles.headline}>Summery</Section.Title>
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
