// @flow
import React, { useCallback, useMemo, useState } from 'react'
import { StyleSheet } from 'react-native'

import InputText from '../common/form/InputText'
import { Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import { BackButton, NextButton, useScreenState } from '../appNavigation/stackNavigation'

import GDStore from '../../lib/undux/GDStore'
import goodWallet from '../../lib/wallet/GoodWallet'

import { withStyles } from '../../lib/styles'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import { navigationOptions } from './utils/sendReceiveFlow'

export type AmountProps = {
  screenProps: any,
  navigation: any,
  styles: any,
}

const SendReason = (props: AmountProps) => {
  const { screenProps } = props
  const { params } = props.navigation.state

  const store = GDStore.useStore()
  const [screenState, setScreenState] = useScreenState(screenProps)
  const [error, setError] = useState()

  const { amount, reason, ...restState } = screenState
  const inviteCode = store.get('inviteCode')

  const { code, hashedCode, paymentLink } = useMemo(() => goodWallet.generatePaymentLink(amount, reason, inviteCode), [
    amount,
    reason,
    inviteCode,
  ])

  const handleContinue = useCallback(() => {
    // checking the link length isn't exceeded the browser's limits.
    // 2000 is a common threshold for the all browsers
    const canContinue = (paymentLink || '').length <= 2000

    setScreenState({ code, hashedCode, paymentLink })

    if (!canContinue) {
      setError('The text you entered in this field is too long.')
    }

    return canContinue
  }, [setError, setScreenState, code, hashedCode, paymentLink])

  const handleReasonChanges = useCallback(reason => setScreenState({ reason }), [setScreenState])

  return (
    <Wrapper>
      <TopBar push={screenProps.push} />
      <Section grow>
        <Section.Stack justifyContent="flex-start" style={styles.container}>
          <Section.Title fontWeight="medium">What For?</Section.Title>
          <InputText
            maxLength={256}
            autoFocus
            style={[props.styles.input, styles.bottomContent]}
            value={reason}
            error={error}
            onChangeText={handleReasonChanges}
            placeholder="Add a message"
          />
        </Section.Stack>
        <Section.Row style={styles.bottomContent}>
          <Section.Row grow={1} justifyContent="flex-start">
            <BackButton mode="text" screenProps={screenProps}>
              Cancel
            </BackButton>
          </Section.Row>
          <Section.Stack grow={3}>
            <NextButton
              nextRoutes={screenState.nextRoutes}
              canContinue={handleContinue}
              values={{ ...restState, amount, reason, code, hashedCode, paymentLink, params }}
              {...props}
              label={reason ? 'Next' : 'Skip'}
            />
          </Section.Stack>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    minHeight: getDesignRelativeHeight(180),
    height: getDesignRelativeHeight(180),
  },
  bottomContent: {
    marginTop: 'auto',
  },
})

SendReason.navigationOptions = navigationOptions

SendReason.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
  return screenState.amount >= 0 && screenState.nextRoutes
}

export default withStyles(({ theme }) => ({
  input: {
    marginTop: theme.sizes.defaultDouble,
  },
}))(SendReason)
