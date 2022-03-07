// @flow

// libraries
import React, { useCallback, useEffect } from 'react'
import { isAddress } from 'web3-utils'

// components
import InputWithAdornment from '../common/form/InputWithAdornment'
import { Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import { BackButton, NextButton, useScreenState } from '../appNavigation/stackNavigation'

// hooks
import { useClipboardPaste } from '../../lib/hooks/useClipboard'
import usePermissions from '../permissions/hooks/usePermissions'
import useValidatedValueState from '../../lib/utils/useValidatedValueState'

// utils
import { useWallet } from '../../lib/wallet/GoodWalletProvider'
import { withStyles } from '../../lib/styles'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import { Permissions } from '../permissions/types'
import { GDTokensWarningBox } from './ReceiveToAddress'

export type TypeProps = {
  screenProps: any,
  navigation: any,
  styles: any,
}

const SendToAddress = (props: TypeProps) => {
  const { screenProps, styles, navigation } = props
  const [screenState, setScreenState] = useScreenState(screenProps)
  const goodWallet = useWallet()

  const { push, navigateTo } = screenProps
  const { params } = navigation.state
  const { address } = screenState

  const validate = value => {
    if (!value) {
      return 'Value is mandatory'
    }

    if (!isAddress(value)) {
      return 'Invalid wallet address'
    }

    if (value.toLowerCase() === goodWallet.account.toLowerCase()) {
      return "You can't send G$s to yourself, you already own your G$s"
    }

    return null
  }

  const [state, setValue] = useValidatedValueState(address, validate)

  useEffect(() => {
    setScreenState({ address: state.value })
  }, [state.value])

  const canContinue = useCallback(() => state.isValid, [state])
  const pasteValueFromClipboard = useClipboardPaste(setValue)

  // check clipboard permission an show dialog is not allowed
  const [, requestClipboardPermissions] = usePermissions(Permissions.Clipboard, {
    requestOnMounted: false,
    onAllowed: pasteValueFromClipboard,
    navigate: navigateTo,
  })

  const handleAdornmentAction = useCallback(requestClipboardPermissions)

  return (
    <Wrapper>
      <TopBar push={push} hideProfile={false} profileAsLink={false} />
      <Section grow>
        <Section.Stack justifyContent="flex-start" style={styles.container}>
          <Section.Title fontWeight="medium">Send To?</Section.Title>
          <InputWithAdornment
            error={state.error}
            onChangeText={setValue}
            maxLength={128}
            placeholder="Enter Wallet Address"
            style={styles.input}
            value={state.value}
            showAdornment
            adornment="paste"
            adornmentAction={handleAdornmentAction}
            adornmentSize={32}
            adornmentStyle={styles.adornmentStyle}
            autoFocus
          />
        </Section.Stack>
        <Section grow justifyContent="center">
          <GDTokensWarningBox isSend={true} />
        </Section>
        <Section.Row alignItems="flex-end">
          <Section.Row grow={1} justifyContent="flex-start">
            <BackButton mode="text" screenProps={screenProps}>
              Cancel
            </BackButton>
          </Section.Row>
          <Section.Stack grow={3}>
            <NextButton
              {...props}
              nextRoutes={screenState.nextRoutes}
              values={{ params, address: state.value }}
              canContinue={canContinue}
              label="Next"
              disabled={!state.isValid}
            />
          </Section.Stack>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

SendToAddress.navigationOptions = {
  title: 'Send G$',
}

SendToAddress.shouldNavigateToComponent = ({ screenProps }) => {
  const { screenState } = screenProps
  return screenState.nextRoutes
}

export default withStyles(({ theme }) => ({
  input: {
    marginTop: 'auto',
  },
  container: {
    minHeight: getDesignRelativeHeight(180),
    height: getDesignRelativeHeight(180),
  },
  adornmentStyle: {
    bottom: 2,
  },
}))(SendToAddress)
