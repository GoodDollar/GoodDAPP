// @flow
import React, { useCallback, useEffect } from 'react'
import { isAddress } from 'web3-utils'
import goodWallet from '../../lib/wallet/GoodWallet'
import InputWithAdornment from '../common/form/InputWithAdornment'
import { Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import { BackButton, NextButton, useScreenState } from '../appNavigation/stackNavigation'
import { withStyles } from '../../lib/styles'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'

import useValidatedValueState from '../../lib/utils/useValidatedValueState'
import { useClipboardPaste } from '../../lib/hooks/useClipboard'

export type TypeProps = {
  screenProps: any,
  navigation: any,
  styles: any,
}

const validate = value => {
  if (!value) {
    return 'Value is mandatory'
  }

  if (!isAddress(value)) {
    return 'Invalid wallet address'
  }

  if (value.toLowercase() === goodWallet.account.toLowerCase()) {
    return "You can't send to G$s to yourself, you already own your G$s"
  }

  return null
}

const SendToAddress = (props: TypeProps) => {
  const { screenProps, styles, navigation } = props
  const [screenState, setScreenState] = useScreenState(screenProps)
  const { params } = navigation.state
  const { address } = screenState
  const [state, setValue] = useValidatedValueState(address, validate)

  useEffect(() => {
    setScreenState({ address: state.value })
  }, [state.value])

  const canContinue = useCallback(() => state.isValid, [state])
  const pasteValueFromClipboard = useClipboardPaste(setValue)

  return (
    <Wrapper>
      <TopBar push={screenProps.push} hideProfile={false} />
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
            adornmentAction={pasteValueFromClipboard}
            adornmentSize={32}
            adornmentStyle={styles.adornmentStyle}
            autoFocus
          />
        </Section.Stack>
        <Section.Row grow alignItems="flex-end">
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

SendToAddress.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
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
