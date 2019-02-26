import React, { useState } from 'react'
import { Wrapper, TopBar, Section, IconButton } from '../common'
import { StyleSheet, Text, View } from 'react-native'
import { TextInput } from 'react-native-paper'

import logger from '../../lib/logger/pino-logger'
import { Button } from 'react-native-elements'

const SEND_TITLE = 'Send GD'

const log = logger.child({ from: SEND_TITLE })

const ScanQRButton = props => <IconButton name="link" text="Scan QR Code" />
const GenerateLinkButton = ({ screenProps, to }) => (
  <IconButton
    name="code"
    text="Generate Link"
    onPress={() => screenProps.push('Amount', { nextRoutes: ['Reason', 'SendLinkSummary'], to })}
  />
)

const Send = props => {
  const [to, setTo] = useState()

  return (
    <Wrapper>
      <TopBar />
      <Section style={styles.bottomSection}>
        <Section.Title>TO WHO?</Section.Title>
        <TextInput onChange={setTo} />
        <Section.Row>
          <ScanQRButton screenProps={props.screenProps} />
          <GenerateLinkButton screenProps={props.screenProps} to={to} />
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

Send.navigationOptions = {
  title: SEND_TITLE
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'baseline'
  },
  bottomSection: {
    flex: 1
  }
})

export default Send
