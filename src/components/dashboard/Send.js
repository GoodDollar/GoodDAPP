import React from 'react'
import { Wrapper, TopBar, Section, IconButton } from '../common'
import { StyleSheet } from 'react-native'
import { TextInput } from 'react-native-paper'
import { useScreenState } from '../appNavigation/stackNavigation'

import logger from '../../lib/logger/pino-logger'

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
  const [screenState, setScreenState] = useScreenState(props.screenProps)

  const { to } = screenState
  return (
    <Wrapper>
      <TopBar />
      <Section style={styles.bottomSection}>
        <Section.Title>TO WHO?</Section.Title>
        <TextInput onChangeText={text => setScreenState({ to: text })} value={to} />
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
