// @flow
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { isMobile } from 'mobile-device-detect'
import isEmail from 'validator/lib/isEmail'
import { normalize } from 'react-native-elements'
import userStorage, { type TransactionEvent } from '../../lib/gundb/UserStorage'
import logger from '../../lib/logger/pino-logger'
import { generateHrefLink, generateSendShareObject } from '../../lib/share'
import GDStore from '../../lib/undux/GDStore'
import isMobilePhone from '../../lib/validators/isMobilePhone'
import goodWallet from '../../lib/wallet/GoodWallet'
import { BackButton, useScreenState } from '../appNavigation/stackNavigation'
import { Avatar, BigGoodDollar, CustomButton, Section, Wrapper } from '../common'
import TopBar from '../common/TopBar'
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
  const store = GDStore.useStore()
  const [hrefLink, setHrefLink] = useState(null)
  const [aButton, setAButton] = useState()
  const [emailOrSMSOnMobile, setEmailOrSMSOnMobile] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isValid, setIsValid] = useState(screenState.isValid)
  const { amount, reason, to } = screenState

  const faceRecognition = () => {
    return screenProps.push('FaceRecognition', { from: 'SendLinkSummary' })
  }

  /**
   * Generates link to send and call send email/sms action
   * @throws Error if link cannot be send
   */
  const generateLinkAndSend = async () => {
    setLoading(true)

    try {
      // Generate link deposit
      const { hashedString, sendLink } = await goodWallet.generateLink(amount, reason, {
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
          userStorage.enqueueTX(transactionEvent)
        }
      })

      try {
        // Show confirmation
        if (emailOrSMSOnMobile) {
          setHrefLink(generateHrefLink(generateSendShareObject(sendLink), to))
          clickAnchorButton()
        } else {
          screenProps.push('SendConfirmation', { sendLink, amount, reason, to })
        }
      } catch (e) {
        log.error(e)
        await goodWallet.cancelOtl(hashedString)
        throw e
      }
    } catch (e) {
      store.set('currentScreen')({
        dialogData: { visible: true, title: 'Error', message: e.message, dismissText: 'OK' }
      })
      log.error(e)
    }

    setLoading(false)
  }

  const clickAnchorButton = () => {
    aButton.click()
    screenProps.goToRoot()
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
    // onComponentDidMount check destination and device used
    setEmailOrSMSOnMobile(isMobile && (isMobilePhone(to) || isEmail(to)))
  }, [])

  useEffect(() => {
    if (isValid === true) {
      if (emailOrSMSOnMobile) {
        clickAnchorButton()
      } else {
        generateLinkAndSend()
      }
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
            <a
              href={hrefLink && hrefLink.link}
              ref={anchor => setAButton(anchor)}
              className="a-button"
              title="Share Link"
            >
              share
            </a>
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
