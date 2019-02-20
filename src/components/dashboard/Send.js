import React from 'react'
import { Wrapper, TopBar, Section, IconButton } from '../common'
import { StyleSheet, Text, View } from 'react-native'
import { TextInput } from 'react-native-paper'

import logger from '../../lib/logger/pino-logger'
import { Button } from 'react-native-elements'

const SEND_TITLE = 'Send GD'

const log = logger.child({ from: SEND_TITLE })

const ScanQRButton = props => <IconButton name="link" text="Scan QR Code" />
const GenerateLinkButton = props => <IconButton name="code" text="Generate Link" />

const Send = props => {
  return (
    <Wrapper>
      <TopBar />
      <Section style={styles.bottomSection}>
        <Section.Title>TO WHO?</Section.Title>
        <TextInput />
        <Section.Row>
          <ScanQRButton />
          <GenerateLinkButton />
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

Send.navigationOptions = {
  title: SEND_TITLE
}

const styles = StyleSheet.create({
  wrapper: {},
  centered: {
    justifyContent: 'center',
    alignItems: 'baseline'
  },
  bottomSection: {
    flex: 1
  }
})

export default Send
