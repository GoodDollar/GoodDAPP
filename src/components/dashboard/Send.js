import web3Utils from 'web3-utils'
import React, { useCallback, useState } from 'react'
import isEmail from '../../lib/validators/isEmail'
import { BackButton, useScreenState } from '../appNavigation/stackNavigation'
import userStorage from '../../lib/userStorage/UserStorage'
import logger from '../../lib/logger/js-logger'
import InputRecipient from '../common/form/InputRecipient'
import isMobilePhone from '../../lib/validators/isMobilePhone'
import { CustomButton, IconButton, Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'

const SEND_TITLE = 'Send G$'

const log = logger.child({ from: SEND_TITLE })

const ScanQRButton = ({ push, disabled }) => {
  const onPress = useCallback(() => push('SendByQR'), [push])
  return <IconButton name="link" text="Scan QR Code" onPress={onPress} disabled={disabled} />
}

/**
 * This button navigates to Amount screen passing nextRoutes param
 * This param is used to navigate with NextButton which will handle push to next screen
 * It also passes to param as initial state for Amount component
 * @param {push} props passed by navigation
 */
const GenerateLinkButton = ({ push, disabled }) => {
  const onPress = useCallback(() => push('Amount', { nextRoutes: ['Reason', 'SendLinkSummary'] }), [push])
  return <IconButton name="qrcode" text="Generate Link" disabled={disabled} onPress={onPress} />
}

const validate = async to => {
  if (!to) {
    return null
  }

  //TODO: fix usage of isUsername
  if (isMobilePhone(to) || isEmail(to) || (await userStorage.isUsername(to))) {
    return null
  }

  if (web3Utils.isAddress(to)) {
    return null
  }

  return `Needs to be a valid username, email or mobile phone (starts with a '+')`
}

const ContinueButton = ({ push, to, disabled, checkError }) => {
  const onContinue = useCallback(async () => {
    if (await checkError()) {
      return
    }

    const address = await userStorage.getUserAddress(to).catch(e => undefined)
    if (address || web3Utils.isAddress(to)) {
      return push('Amount', { to: address || to, nextRoutes: ['Reason', 'SendLinkSummary'] })
    }
    if (to && (isMobilePhone(to) || isEmail(to))) {
      return push('Amount', { to, nextRoutes: ['Reason', 'SendLinkSummary'] })
    }
    log.debug(`Oops, no error and no action`)
  }, [checkError, push, to])

  return (
    <CustomButton onPress={onContinue} disabled={disabled} style={{ flex: 2 }}>
      Next
    </CustomButton>
  )
}

const Send = ({ screenProps }) => {
  const [screenState, setScreenState] = useScreenState(screenProps)
  const { push, navigateTo } = screenProps
  const [error, setError] = useState()
  const { to } = screenState

  const checkError = async () => {
    const response = await validate(to)
    setError(response)
    return response
  }

  return (
    <Wrapper>
      <TopBar push={push} />
      <Section grow>
        <Section.Title>Send To?</Section.Title>
        <Section.Stack grow={1} justifyContent="space-around">
          <InputRecipient
            onChangeText={text => setScreenState({ to: text })}
            onBlur={checkError}
            to={to}
            error={error}
            navigate={navigateTo}
          />
        </Section.Stack>
        <Section.Row grow={2} justifyContent="flex-end">
          <ScanQRButton push={push} disabled={!!to} />
          <GenerateLinkButton push={push} disabled={!!to} />
        </Section.Row>
        <Section.Row>
          <Section.Stack grow={1}>
            <BackButton screenProps={screenProps}>Cancel</BackButton>
          </Section.Stack>
          <Section.Stack grow={2}>
            <ContinueButton push={push} to={to} disabled={!to} checkError={checkError} />
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
