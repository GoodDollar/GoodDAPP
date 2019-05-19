import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Icon, normalize } from 'react-native-elements'
import { BackButton, useScreenState } from '../appNavigation/stackNavigation'
import { HelperText, TextInput } from 'react-native-paper'
import isEmail from 'validator/lib/isEmail'
import userStorage from '../../lib/gundb/UserStorage'
import logger from '../../lib/logger/pino-logger'
import { readCode } from '../../lib/share'
import { useDialog } from '../../lib/undux/utils/dialog'
import Clipboard from '../../lib/utils/Clipboard'
import isMobilePhone from '../../lib/validators/isMobilePhone'
import goodWallet from '../../lib/wallet/GoodWallet'
import { CustomButton, IconButton, Section, TopBar, Wrapper } from '../common'
import { routeAndPathForCode } from './utils/routeAndPathForCode'

const SEND_TITLE = 'Send G$'

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

const validate = async to => {
  if (!to) return null

  if (isMobilePhone(to) || isEmail(to)) return null

  if (goodWallet.wallet.utils.isAddress(to)) return null

  return `Needs to be a valid wallet address, email or mobile phone (starts with a '+')`
}

const ContinueButton = ({ screenProps, to, disabled, checkError }) => (
  <CustomButton
    onPress={async () => {
      if (await checkError()) return

      if (to && (isMobilePhone(to) || isEmail(to))) {
        const address = await userStorage.getUserAddress(to)
        if (address) {
          return screenProps.push('Amount', { address, nextRoutes: ['Reason', 'SendQRSummary'] })
        } else {
          return screenProps.push('Amount', { to, nextRoutes: ['Reason', 'SendLinkSummary'] })
        }
      }

      if (to && goodWallet.wallet.utils.isAddress(to)) {
        return screenProps.push('Amount', { to, nextRoutes: ['Reason', 'SendQRSummary'] })
      }
      log.debug(`Oops, no error and no action`)
    }}
    mode="contained"
    disabled={disabled}
    style={{ flex: 2 }}
  >
    NEXT
  </CustomButton>
)

const Send = props => {
  const [screenState, setScreenState] = useScreenState(props.screenProps)
  const [error, setError] = useState()
  const [showDialogWithData] = useDialog()

  useEffect(() => {
    const { screenProps } = props
    const { state } = props.navigation

    if (state.params && state.params.code) {
      const code = readCode(state.params.code)
      routeAndPathForCode('send', code)
        .then(({ route, params }) => screenProps.push(route, params))
        .catch(({ message }) => {
          showDialogWithData({
            title: 'Error',
            message,
            onDismiss: screenProps.goToRoot
          })
        })
    }
  }, [])

  const { to } = screenState

  const checkError = async () => {
    const response = await validate(to)
    setError(response)
    return response
  }

  const pasteToWho = async () => {
    try {
      const who = await Clipboard.getString()
      log.info({ who })
      setScreenState({ to: who })
    } catch (err) {
      log.error('Paste action failed', err)
    }
  }

  return (
    <Wrapper>
      <TopBar push={props.screenProps.push} />
      <Section style={styles.bottomSection}>
        <View style={styles.topContainer}>
          <Section.Title style={styles.title}>TO WHOM?</Section.Title>
          <View style={styles.iconInputContainer}>
            <View style={styles.pasteIcon}>
              <Icon size={normalize(16)} color="#282c34" name="content-paste" onClick={pasteToWho} />
            </View>
            <TextInput
              onChangeText={text => setScreenState({ to: text })}
              onBlur={checkError}
              value={to}
              error={error}
              style={styles.input}
              placeholder="Phone Number / Email / Username"
              autoFocus
            />
          </View>
          <HelperText type="error" visible={error}>
            {error}
          </HelperText>
          <Section.Row>
            <ScanQRButton screenProps={props.screenProps} disabled={!!to} />
            <GenerateLinkButton screenProps={props.screenProps} disabled={!!to} />
          </Section.Row>
        </View>
        <View style={styles.bottomContainer}>
          <BackButton mode="text" screenProps={props.screenProps} style={{ flex: 1 }}>
            Cancel
          </BackButton>
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
  title: {
    fontSize: normalize(24),
    fontWeight: '500'
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'baseline'
  },
  bottomSection: {
    flex: 1,
    paddingTop: normalize(22),
    justifyContent: 'space-between'
  },
  bottomContainer: {
    width: '100%',
    flexDirection: 'row',
    marginTop: '1rem'
  },
  topContainer: {
    flex: 1
  },
  iconInputContainer: {
    display: 'inline-flex',
    position: 'relative'
  },
  input: {
    flex: 1,
    backgroundColor: 'inherit',
    marginTop: normalize(10)
  },
  pasteIcon: {
    position: 'absolute',
    cursor: 'pointer',
    right: 0,
    paddingTop: normalize(30),
    zIndex: 1
  }
})

export default Send
