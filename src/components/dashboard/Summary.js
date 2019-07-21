// @flow
import React from 'react'
import normalize from 'react-native-elements/src/helpers/normalizeText'

import { BigGoodDollar, Section, TopBar, Wrapper } from '../common'
import { BackButton, NextButton, useScreenState } from '../appNavigation/stackNavigation'

import { withStyles } from '../../lib/styles'
import { ACTION_RECEIVE, navigationOptions } from './utils/sendReceiveFlow'

export type ReceiveProps = {
  screenProps: any,
  navigation: any,
  theme: any,
}

const CounterPartyRow = props => {
  const { styles, displayName, action } = props
  if (!displayName) {
    return null
  }

  return (
    <Section.Row style={styles.tableRow}>
      <Section.Text style={styles.tableRowLabel}>{action === ACTION_RECEIVE ? 'From:' : 'To:'}</Section.Text>
      <Section.Text fontSize={24} fontWeight="bold">
        {displayName}
      </Section.Text>
    </Section.Row>
  )
}

const AmountRow = props => {
  const { amount, styles } = props
  if (!amount) {
    return null
  }
  return (
    <Section.Row style={styles.tableRow}>
      <Section.Text style={styles.tableRowLabel}>Amount:</Section.Text>
      <BigGoodDollar elementStyles={styles.bigGoodDollar} number={amount} color={styles.bigGoodDollar.color} />
    </Section.Row>
  )
}

const ReasonRow = props => {
  const { reason, styles } = props
  if (!reason) {
    return null
  }
  return (
    <Section.Row style={styles.tableRow}>
      <Section.Text style={styles.tableRowLabel}>For:</Section.Text>
      <Section.Text fontSize={16}>{reason}</Section.Text>
    </Section.Row>
  )
}

const Summary = ({ screenProps, ...props }: ReceiveProps) => {
  const [screenState] = useScreenState(screenProps)
  const { params } = props.navigation.state

  const { amount, reason, counterPartyDisplayName } = screenState
  const styles = getStylesFromProps(props)

  return (
    <Wrapper>
      <TopBar push={screenProps.push} />
      <Section justifyContent="space-between" grow>
        <Section.Title>Summary</Section.Title>
        <Section.Stack grow justifyContent="center">
          <CounterPartyRow displayName={counterPartyDisplayName} styles={styles} action={params.action} />
          <AmountRow amount={amount} styles={styles} />
          <ReasonRow reason={reason} styles={styles} />
        </Section.Stack>
        <Section.Row>
          <Section.Row grow={1} justifyContent="flex-start">
            <BackButton mode="text" screenProps={screenProps}>
              Cancel
            </BackButton>
          </Section.Row>
          <Section.Stack grow={3}>
            <NextButton
              nextRoutes={screenState.nextRoutes}
              values={{ reason, amount, counterPartyDisplayName, params }}
              screenProps={screenProps}
              label={'Confirm'}
            />
          </Section.Stack>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

Summary.navigationOptions = navigationOptions

Summary.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
  return screenState.amount
}

const getStylesFromProps = ({ theme }) => {
  return {
    tableRow: {
      // TODO: see where should we take this color from
      borderBottomColor: theme.colors.gray50Percent,
      borderBottomWidth: normalize(1),
      borderBottomStyle: 'solid',
      marginTop: theme.sizes.defaultDouble,
      alignItems: 'baseline',
      paddingBottom: theme.sizes.default,
    },

    // TODO: all this properties can be removed once we merge Text component in
    tableRowLabel: {
      color: '#A3A3A3',
    },
    bigGoodDollar: {
      color: theme.colors.primary,
      fontSize: normalize(24),
      fontFamily: theme.fonts.bold,
    },
    reason: {
      fontSize: normalize(16),
    },
    doneButton: {
      marginTop: theme.sizes.default,
    },
  }
}

export default withStyles(getStylesFromProps)(Summary)
