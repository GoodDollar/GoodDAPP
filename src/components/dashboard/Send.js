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

const SEND_TITLE = 'Send G$'

const log = logger.child({ from: SEND_TITLE })

const ScanQRButton = ({ push, disabled }) => (
  <IconButton name="link" text="Scan QR Code" onPress={() => push('SendByQR')} disabled={disabled} />
)

/**
 * This button navigates to Amount screen passing nextRoutes param
 * This param is used to navigate with NextButton which will handle push to next screen
 * It also passes to param as initial state for Amount component
 * @param {push} props passed by navigation
 */
const GenerateLinkButton = ({ push, disabled }) => (
  <IconButton
    name="qrcode"
    text="Generate Link"
    disabled={disabled}
    onPress={() => push('Amount', { nextRoutes: ['Reason', 'SendLinkSummary'] })}
  />
)

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

const ContinueButton = ({ push, to, disabled, checkError }) => (
  <CustomButton
    onPress={async () => {
      if (await checkError()) {
        return
      }

      const address = await userStorage.getUserAddress(to).catch(e => undefined)
      if (address || goodWallet.wallet.utils.isAddress(to)) {
        return push('Amount', { to: address || to, nextRoutes: ['Reason', 'SendQRSummary'] })
      }
      if (to && (isMobilePhone(to) || isEmail(to))) {
        return push('Amount', { to, nextRoutes: ['Reason', 'SendLinkSummary'] })
      }
      log.debug(`Oops, no error and no action`)
    }}
    disabled={disabled}
    style={{ flex: 2 }}
  >
    Next
  </CustomButton>
)

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
