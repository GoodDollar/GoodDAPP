// @flow
import React, { useCallback } from 'react'
import { Clipboard, StyleSheet, Text, View } from 'react-native'
import QRCode from 'qrcode.react'

import logger from '../../lib/logger/pino-logger'
import { Section, Wrapper, CustomButton, TopBar } from '../common'
import { fontStyle } from '../common/styles'
import { DoneButton, useScreenState } from '../appNavigation/stackNavigation'

export type ReceiveProps = {
  screenProps: any,
  navigation: any
}

const SEND_TITLE = 'Send GD'
const log = logger.child({ from: SEND_TITLE })

const SendConfirmation = ({ screenProps, navigation }: ReceiveProps) => {
  const [screenState] = useScreenState(screenProps)

  const { sendLink } = screenState

  const copySendLink = useCallback(() => {
    Clipboard.setString(sendLink)
    log.info('Account address copied', { sendLink })
  }, [sendLink])

  return (
    <Wrapper>
      <TopBar hideBalance push={screenProps.push} />
      <Section style={styles.section}>
        <View style={styles.sectionTop}>
          <Section.Row style={[{}]}>
            <View style={styles.qrCode}>
              <QRCode value={sendLink || ''} />
            </View>
          </Section.Row>
          <View style={styles.addressSection}>
            <Text style={[styles.centered, styles.url]}>{sendLink}</Text>
          </View>
        </View>
      </Section>
      <View style={styles.sectionBottom}>
        <CustomButton style={styles.buttonStyle} onPress={copySendLink} mode="contained">
          Copy Link to Clipboard
        </CustomButton>
        <DoneButton style={styles.buttonStyle} screenProps={screenProps} />
      </View>
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  section: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    alignContent: 'stretch'
  },
  sectionTop: {
    flex: 2,
    flexDirection: 'column',
    maxWidth: '100%',
    alignItems: 'center'
  },
  sectionBottom: {
    width: '100%',
    flexDirection: 'column'
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
