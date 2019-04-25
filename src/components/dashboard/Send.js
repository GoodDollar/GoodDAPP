import React, { useState } from 'react'
import { Wrapper, TopBar, Section, IconButton, CustomButton } from '../common'
import { StyleSheet, View } from 'react-native'
import { HelperText, TextInput } from 'react-native-paper'
import { useScreenState } from '../appNavigation/stackNavigation'
import isMobilePhone from '../../lib/validators/isMobilePhone'
import isEmail from 'validator/lib/isEmail'
import goodWallet from '../../lib/wallet/GoodWallet'
import logger from '../../lib/logger/pino-logger'

const SEND_TITLE = 'Send GD'

const log = logger.child({ from: SEND_TITLE })

const ScanQRButton = ({ screenProps, disabled }) => (
  <IconButton name="link" text="Scan QR Code" onPress={() => screenProps.push('SendByQR')} disabled={disabled} />
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

const validate = to => {
  if (!to) return null

  if (isMobilePhone(to) || isEmail(to)) {
    return null
  }

  if (goodWallet.wallet.utils.isAddress(to)) {
    return null
  }
  return `Needs to be a valid address, email or mobile phone`
}

const ContinueButton = ({ screenProps, to, disabled, checkError }) => (
  <CustomButton
    onPress={() => {
      if (checkError()) return

      if (to && (isMobilePhone(to) || isEmail(to))) {
        return screenProps.push('Amount', { to, nextRoutes: ['Reason', 'SendLinkSummary'] })
      }

      if (to && goodWallet.wallet.utils.isAddress(to)) {
        return screenProps.push('Amount', { to, nextRoutes: ['Reason', 'SendQRSummary'] })
      }
      log.debug(`Oops, no error and no action`)
    }}
    mode="contained"
    disabled={disabled}
  >
    Continue
  </CustomButton>
)

const Send = props => {
  const [screenState, setScreenState] = useScreenState(props.screenProps)
  const [error, setError] = useState()

  const { to } = screenState
  const checkError = () => {
    const err = validate(to)
    setError(err)
    return err
  }

  return (
    <Wrapper>
      <TopBar push={props.screenProps.push} />
      <Section style={styles.bottomSection}>
        <View style={styles.topContainer}>
          <Section.Title>TO WHO?</Section.Title>
          <TextInput onChangeText={text => setScreenState({ to: text })} onBlur={checkError} value={to} error={error} />
          <HelperText type="error" visible={error}>
            {error}
          </HelperText>
          <Section.Row>
            <ScanQRButton screenProps={props.screenProps} disabled={!!to} />
            <GenerateLinkButton screenProps={props.screenProps} disabled={!!to} />
          </Section.Row>
        </View>
        <View style={styles.bottomContainer}>
          <ContinueButton screenProps={props.screenProps} to={to} disabled={!to} checkError={checkError} />
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
