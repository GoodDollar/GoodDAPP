import React from 'react'
import { Wrapper, TopBar, Section, IconButton, CustomButton } from '../common'
import { StyleSheet, View } from 'react-native'
import { TextInput } from 'react-native-paper'
import { useScreenState } from '../appNavigation/stackNavigation'

import logger from '../../lib/logger/pino-logger'

const SEND_TITLE = 'Send GD'

const log = logger.child({ from: SEND_TITLE })

const ScanQRButton = ({ screenProps, disabled }) => (
  <IconButton name="link" text="Scan QR Code" onPress={() => screenProps.push('ScanQR')} disabled={disabled} />
)

/**
 * This button navigates to Amount screen passing nextRoutes param
 * This param is used to navigate with NextButton which will handle push to next screen
 * It also passes to param as initial state for Amount component
 * @param {screenProps} props passed by navigation
 */
const GenerateLinkButton = ({ screenProps, disabled }) => (
  <IconButton
    name="code"
    text="Generate Link"
    disabled={disabled}
    onPress={() => screenProps.push('Amount', { nextRoutes: ['Reason', 'SendLinkSummary'] })}
  />
)

const ContinueButton = ({ screenProps, to, disabled }) => (
  <CustomButton
    onPress={() => screenProps.push('Amount', { to, nextRoutes: ['Reason', 'SendQRSummary'] })}
    mode="contained"
    disabled={disabled}
  >
    Continue
  </CustomButton>
)

const Send = props => {
  const [screenState, setScreenState] = useScreenState(props.screenProps)

  const { to } = screenState
  return (
    <Wrapper>
      <TopBar />
      <Section style={styles.bottomSection}>
        <View style={styles.topContainer}>
          <Section.Title>TO WHO?</Section.Title>
          <TextInput onChangeText={text => setScreenState({ to: text })} value={to} />
          <Section.Row>
            <ScanQRButton screenProps={props.screenProps} disabled={!!to} />
            <GenerateLinkButton screenProps={props.screenProps} disabled={!!to} />
          </Section.Row>
        </View>
        <View style={styles.bottomContainer}>
          <ContinueButton screenProps={props.screenProps} to={to} />
        </View>
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
  },
  topContainer: {
    flex: 1
  }
})

export default Send
