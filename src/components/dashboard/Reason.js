// @flow
import React from 'react'
import { StyleSheet } from 'react-native'
import InputText from '../common/form/InputText'
import { Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import { BackButton, NextButton, useScreenState } from '../appNavigation/stackNavigation'
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

  const [screenState, setScreenState] = useScreenState(screenProps)
  const { reason, ...restState } = screenState

  return (
    <Wrapper>
      <TopBar push={screenProps.push} />
      <Section grow>
        <Section.Stack justifyContent="flex-start" style={styles.container}>
          <Section.Title>What For?</Section.Title>
          <InputText
            autoFocus
            style={[props.styles.input, styles.bottomContent]}
            value={reason}
            onChangeText={reason => setScreenState({ reason })}
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
              values={{ ...restState, reason, params }}
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

export default withStyles(({ theme }) => ({ input: { marginTop: theme.sizes.defaultDouble } }))(SendReason)
