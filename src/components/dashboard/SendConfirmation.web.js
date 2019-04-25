// @flow
import React, { useCallback } from 'react'
import { Clipboard, StyleSheet, Text, View } from 'react-native'
import QRCode from 'qrcode.react'
import { normalize } from 'react-native-elements'

import logger from '../../lib/logger/pino-logger'
import { Section, Wrapper, CustomButton, TopBar, BigGoodDollar } from '../common'
import { fontStyle } from '../common/styles'
import { DoneButton, useScreenState } from '../appNavigation/stackNavigation'
import './AButton.css'
import { receiveStyles } from './styles'

export type ReceiveProps = {
  screenProps: any,
  navigation: any
}

const SEND_TITLE = 'Send GD'
const log = logger.child({ from: SEND_TITLE })

const SendConfirmation = ({ screenProps, navigation }: ReceiveProps) => {
  const [screenState] = useScreenState(screenProps)

  const { amount, reason, sendLink, hrefLink } = screenState

  const copySendLink = useCallback(() => {
    Clipboard.setString(sendLink)
    log.info('Account address copied', { sendLink })
  }, [sendLink])

  return (
    <Wrapper style={styles.wrapper}>
      <TopBar hideBalance push={screenProps.push} />
      <Section style={styles.section}>
        <Section.Row style={styles.sectionRow}>
          <View style={styles.qrCode}>
            <QRCode value={sendLink || ''} />
          </View>
          <Section.Text style={styles.addressSection}>
            <Text style={styles.url}>{sendLink}</Text>
          </Section.Text>
          <Section.Text style={styles.secondaryText} onPress={copySendLink}>
            Copy link to clipboard
          </Section.Text>
          <Section.Text>
            {`Here's `}
            <BigGoodDollar number={amount} />
          </Section.Text>
          <Section.Text>{reason && `For ${reason}`}</Section.Text>
          <View style={styles.buttonGroup}>
            <a href={hrefLink} className="a-button" title="Share Link">
              Share Link
            </a>
            <DoneButton style={styles.buttonStyle} screenProps={screenProps} />
          </View>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  ...receiveStyles,
  section: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    alignContent: 'stretch'
  },
  sectionRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%'
  },
  sectionTop: {
    flex: 2,
    flexDirection: 'column',
    maxWidth: '100%',
    alignItems: 'center'
  },
  buttonGroup: {
    width: '100%',
    flexDirection: 'column',
    marginTop: '1rem',
    flex: 1
  },
  qrCode: {
    marginTop: '2rem',
    padding: '1rem',
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: '4px'
  },
  addressSection: {
    marginBottom: '1rem',
    marginTop: '1rem',
    maxWidth: '100%'
  },
  url: {
    ...fontStyle,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    maxWidth: '100%',
    paddingLeft: '1rem',
    paddingRight: '1rem'
  },
  buttonStyle: {
    marginTop: '1em'
  }
})

SendConfirmation.navigationOptions = {
  title: SEND_TITLE,
  backButtonHidden: true
}

SendConfirmation.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
  return !!screenState.sendLink
}

export default SendConfirmation
