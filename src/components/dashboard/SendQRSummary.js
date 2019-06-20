// @flow
/**
 * @file Displays a summary when sending G$ directly to a blockchain address
 */
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import userStorage, { type TransactionEvent } from '../../lib/gundb/UserStorage'
import logger from '../../lib/logger/pino-logger'
import { useDialog } from '../../lib/undux/utils/dialog'
import { useWrappedGoodWallet } from '../../lib/wallet/useWrappedWallet'
import { BackButton, useScreenState } from '../appNavigation/stackNavigation'
import { Avatar, BigGoodDollar, CustomButton, Section, Wrapper } from '../common'
import TopBar from '../common/TopBar'
import { receiveStyles } from './styles'

export type AmountProps = {
  screenProps: any,
  navigation: any
}

const TITLE = 'Send G$'

const log = logger.child({ from: 'SendQRSummary' })

/**
 * Screen that shows transaction summary for a send qr action
 * @param {AmountProps} props
 * @param {any} props.screenProps
 * @param {any} props.navigation
 */
const SendQRSummary = (props: AmountProps) => {
  const { screenProps } = props
  const [screenState] = useScreenState(screenProps)
  const goodWallet = useWrappedGoodWallet()
  const [showDialog] = useDialog()
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
    return screenProps.push('FaceRecognition', { from: 'SendQRSummary' })
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
              amount
            }
          }
          userStorage.enqueueTX(transactionEvent)
          showDialog({
            visible: true,
            title: 'SUCCESS!',
            message: 'The G$ was sent successfully',
            dismissText: 'Yay!',
            onDismiss: screenProps.goToRoot
          })
          return hash
        },
        onError: e => {
          log.error('Send TX failed:', { e, message: e.message })
          showDialog({
            visible: true,
            title: 'Transaction Failed!',
            message: `There was a problem sending G$. Try again`,
            dismissText: 'OK'
          })
        }
      })
    } catch (e) {
      log.error('Send TX failed:', { e, message: e.message })
      showDialog({
        visible: true,
        title: 'Transaction Failed!',
        message: `There was a problem sending G$. Try again`,
        dismissText: 'OK'
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
    <Wrapper style={styles.wrapper}>
      <TopBar push={screenProps.push} />
      <Section style={styles.section}>
        <Section.Row style={styles.sectionRow}>
          <Section.Title style={styles.headline}>Summary</Section.Title>
          <View style={styles.sectionTo}>
            <Avatar size={90} style={styles.avatar} source={profile && profile.avatar} />
            {to && <Section.Text style={styles.toText}>{`To: ${to}`}</Section.Text>}
            {profile.name && <Section.Text style={styles.toText}>{`Name: ${profile.name}`}</Section.Text>}
          </View>
          <Section.Text>
            {`Here's `}
            <BigGoodDollar number={amount} />
          </Section.Text>
          <Section.Text>{reason ? reason : null}</Section.Text>
          <View style={styles.buttonGroup}>
            <BackButton mode="text" screenProps={screenProps} style={{ flex: 1 }}>
              Cancel
            </BackButton>
            <CustomButton
              mode="contained"
              onPress={async () => {
                ;(await goodWallet.isCitizen()) ? sendGD() : faceRecognition()
              }}
              style={{ flex: 2 }}
              loading={loading}
            >
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
  headline: {
    textTransform: 'uppercase'
  },
  sectionTo: {
    alignItems: 'center'
  },
  toText: {
    marginTop: '1rem',
    marginBottom: '1rem'
  },
  avatar: {
    backgroundColor: 'white'
  }
}

SendQRSummary.navigationOptions = {
  title: TITLE
}

SendQRSummary.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps

  // Component shouldn't be loaded if there's no 'amount', nor 'to' fields with data
  return (!!screenState.amount && !!screenState.to) || screenState.from
}

export default SendQRSummary
