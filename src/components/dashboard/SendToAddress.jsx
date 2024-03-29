// @flow

// libraries
import React, { useCallback, useContext, useEffect } from 'react'
import { isAddress } from 'web3-utils'
import { t } from '@lingui/macro'

// components
import InputWithAdornment from '../common/form/InputWithAdornment'
import { ScanQRButton, Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import { BackButton, NextButton, useScreenState } from '../appNavigation/stackNavigation'

// hooks
import { useClipboardPaste } from '../../lib/hooks/useClipboard'
import usePermissions from '../permissions/hooks/usePermissions'
import useValidatedValueState from '../../lib/utils/useValidatedValueState'

// utils
import { TokenContext, useWallet } from '../../lib/wallet/GoodWalletProvider'
import { withStyles } from '../../lib/styles'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import { Permissions } from '../permissions/types'
import Config from '../../config/config'
import { GDTokensWarningBox } from './ReceiveToAddress'
import { navigationOptions } from './utils/sendReceiveFlow'

export type TypeProps = {
  screenProps: any,
  navigation: any,
  styles: any,
}

const { isDeltaApp } = Config

const SendToAddress = (props: TypeProps) => {
  const { screenProps, styles, navigation } = props
  const [screenState, setScreenState] = useScreenState(screenProps)
  const goodWallet = useWallet()
  const { native } = useContext(TokenContext)

  const { push, navigateTo } = screenProps
  const { params = {} } = navigation.state
  const { address = null, ...restState } = screenState

  const validate = useCallback(
    value => {
      if (!value) {
        return t`Value is mandatory`
      }

      if (!isAddress(value)) {
        return t`Invalid wallet address`
      }

      if (value.toLowerCase() === goodWallet.account.toLowerCase()) {
        return t`You can't send G$s to yourself, you already own your G$s`
      }

      return null
    },
    [goodWallet],
  )

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

  const handlePressQR = useCallback(() => push('SendByQR'), [push])
  const isNativeFlow = isDeltaApp && native

  return (
    <Wrapper>
      <TopBar push={push} hideBalance={true} hideProfile={false} profileAsLink={false}>
        {isNativeFlow && <ScanQRButton onPress={handlePressQR} />}
      </TopBar>
      <Section grow>
        <Section.Stack justifyContent="flex-start" style={styles.container}>
          <Section.Title fontWeight="medium">Send To?</Section.Title>
          <InputWithAdornment
            error={state.error}
            onChangeText={setValue}
            maxLength={128}
            placeholder={t`Enter Wallet Address`}
            style={styles.input}
            value={state.value}
            showAdornment
            adornment="paste"
            adornmentAction={requestClipboardPermissions}
            adornmentSize={32}
            adornmentStyle={styles.adornmentStyle}
            autoFocus
          />
        </Section.Stack>
        {!isNativeFlow && (
          <Section grow justifyContent="center">
            <GDTokensWarningBox isSend={true} />
          </Section>
        )}
        <Section.Row alignItems="flex-end">
          <Section.Row grow={1} justifyContent="flex-start">
            <BackButton mode="text" screenProps={screenProps}>
              {t`Cancel`}
            </BackButton>
          </Section.Row>
          <Section.Stack grow={3}>
            <NextButton
              {...props}
              nextRoutes={screenState.nextRoutes}
              values={{ ...params, ...restState, address: state.value }}
              canContinue={canContinue}
              label={t`Next`}
              disabled={!state.isValid}
            />
          </Section.Stack>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

SendToAddress.navigationOptions = navigationOptions

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
