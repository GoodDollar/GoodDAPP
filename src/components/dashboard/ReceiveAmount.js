// @flow
import React from 'react'
import normalize from 'react-native-elements/src/helpers/normalizeText'

import { BigGoodDollar, Section, TopBar, Wrapper } from '../common'
import { BackButton, useScreenState } from '../appNavigation/stackNavigation'
import { PushButton } from '../appNavigation/PushButton'

import { withStyles } from '../../lib/styles'

export type ReceiveProps = {
  screenProps: any,
  navigation: any,
  theme: any,
}

const RECEIVE_TITLE = 'Receive G$'

const FromRow = props => {
  const { styles, counterPartyDisplayName } = props
  if (!counterPartyDisplayName) {
    return null
  }

  return (
    <Section.Row style={styles.tableRow}>
      <Section.Text style={styles.tableRowLabel}>From:</Section.Text>
      <Section.Text fontSize={24} fontWeight="bold">
        {counterPartyDisplayName}
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

const ReceiveAmount = ({ screenProps, ...props }: ReceiveProps) => {
  const [screenState] = useScreenState(screenProps)
  const { amount, reason, fromWho } = screenState
  const styles = getStylesFromProps(props)

  return (
    <Wrapper>
      <TopBar push={screenProps.push} />
      <Section justifyContent="space-between" grow>
        <Section.Title>Summary</Section.Title>
        <Section.Stack grow justifyContent="center">
          <FromRow counterPartyDisplayName={fromWho} styles={styles} />
          <AmountRow amount={amount} styles={styles} />
          <ReasonRow reason={reason} styles={styles} />
        </Section.Stack>
        <Section.Row>
          <Section.Stack grow={1}>
            <BackButton mode="text" screenProps={screenProps}>
              Cancel
            </BackButton>
          </Section.Stack>
          <Section.Stack grow={2}>
            <PushButton
              routeName="ReceiveConfirmation"
              screenProps={screenProps}
              params={{ reason, amount, counterPartyDisplayName: fromWho }}
            >
              Confirm
            </PushButton>
          </Section.Stack>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

ReceiveAmount.navigationOptions = {
  title: RECEIVE_TITLE,
}

ReceiveAmount.shouldNavigateToComponent = props => {
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

export default withStyles(getStylesFromProps)(ReceiveAmount)
