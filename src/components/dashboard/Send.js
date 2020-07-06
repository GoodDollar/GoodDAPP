import React, { useState } from 'react'
import isEmail from 'validator/lib/isEmail'
import { BackButton, useScreenState } from '../appNavigation/stackNavigation'
import userStorage from '../../lib/gundb/UserStorage'
import logger from '../../lib/logger/pino-logger'
import InputRecipient from '../common/form/InputRecipient'
import isMobilePhone from '../../lib/validators/isMobilePhone'
import goodWallet from '../../lib/wallet/GoodWallet'
import { CustomButton, IconButton, Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import useOnPress from '../../lib/hooks/useOnPress'

const SEND_TITLE = 'Send G$'

const log = logger.child({ from: SEND_TITLE })

const ScanQRButton = ({ screenProps, disabled }) => {
  const handlePress = useOnPress(() => screenProps.push('SendByQR'), [screenProps])

  return <IconButton name="link" text="Scan QR Code" onPress={handlePress} disabled={disabled} />
}

/**
 * This button navigates to Amount screen passing nextRoutes param
 * This param is used to navigate with NextButton which will handle push to next screen
 * It also passes to param as initial state for Amount component
 * @param {screenProps} props passed by navigation
 */
const GenerateLinkButton = ({ screenProps, disabled }) => {
  /*eslint-disable */
  const handlePress = useOnPress(
    () => screenProps.push('Amount', { nextRoutes: ['Reason', 'SendLinkSummary'] }),
    [screenProps]
  )
  /*eslint-enable */

  return <IconButton name="qrcode" text="Generate Link" disabled={disabled} onPress={handlePress} />
}

const validate = async to => {
  if (!to) {
    return null
  }

  if (isMobilePhone(to) || isEmail(to) || (await userStorage.isUsername(to))) {
    return null
  }

  if (goodWallet.wallet.utils.isAddress(to)) {
    return null
  }

  return `Needs to be a valid username, email or mobile phone (starts with a '+')`
}

const ContinueButton = ({ screenProps, to, disabled, checkError }) => {
  const handlePress = useOnPress(async () => {
    if (await checkError()) {
      return
    }

    const address = await userStorage.getUserAddress(to).catch(() => undefined)
    if (address || goodWallet.wallet.utils.isAddress(to)) {
      return screenProps.push('Amount', { to: address || to, nextRoutes: ['Reason', 'SendQRSummary'] })
    }

    if (to && (isMobilePhone(to) || isEmail(to))) {
      return screenProps.push('Amount', { to, nextRoutes: ['Reason', 'SendLinkSummary'] })
    }

    log.debug(`Oops, no error and no action`)
  }, [checkError, screenProps])

  return (
    <CustomButton onPress={handlePress} disabled={disabled} style={{ flex: 2 }}>
      Next
    </CustomButton>
  )
}

const Send = props => {
  const [screenState, setScreenState] = useScreenState(props.screenProps)
  const [error, setError] = useState()
  const { to } = screenState

  const checkError = async () => {
    const response = await validate(to)
    setError(response)
    return response
  }

  return (
    <Wrapper>
      <TopBar push={props.screenProps.push} />
      <Section grow>
        <Section.Title>Send To?</Section.Title>
        <Section.Stack grow={1} justifyContent="space-around">
          <InputRecipient
            onChangeText={text => setScreenState({ to: text })}
            onBlur={checkError}
            to={to}
            error={error}
          />
        </Section.Stack>
        <Section.Row grow={2} justifyContent="flex-end">
          <ScanQRButton screenProps={props.screenProps} disabled={!!to} />
          <GenerateLinkButton screenProps={props.screenProps} disabled={!!to} />
        </Section.Row>
        <Section.Row>
          <Section.Stack grow={1}>
            <BackButton screenProps={props.screenProps}>Cancel</BackButton>
          </Section.Stack>
          <Section.Stack grow={2}>
            <ContinueButton screenProps={props.screenProps} to={to} disabled={!to} checkError={checkError} />
          </Section.Stack>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

Send.navigationOptions = {
  title: SEND_TITLE,
}

export default Send
