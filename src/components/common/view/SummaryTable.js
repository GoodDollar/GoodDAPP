import React from 'react'
import normalize from '../../../lib/utils/normalizeText'
import Section from '../layout/Section'
import { withStyles } from '../../../lib/styles'
import BigGoodDollar from './BigGoodDollar'

const WhoRow = props => {
  const { styles, counterPartyDisplayName, actionReceive } = props
  if (!counterPartyDisplayName) {
    return null
  }

  return (
    <Section.Row style={styles.tableRow}>
      <Section.Text style={styles.tableRowLabel}>{actionReceive ? 'From:' : 'To:'}</Section.Text>
      <Section.Text color="darkGray" fontSize={24} fontWeight="500">
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
      <BigGoodDollar
        bigNumberStyles={styles.bigGoodDollar}
        bigNumberUnitStyles={styles.bigGoodDollarUnit}
        number={amount}
        color={props.theme.colors.primary}
      />
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

/**
 *
 * @param {any} props.styles injected via `withStyles`
 * @param {String} props.counterPartyDisplayName
 * @param {String} props.amount
 * @param {Boolean} props.actionReceive if true text is for receive summary
 */
const SummaryTable = ({ styles, counterPartyDisplayName, amount, reason, actionReceive, theme }) => (
  <Section.Stack grow justifyContent="center">
    <WhoRow counterPartyDisplayName={counterPartyDisplayName} styles={styles} actionReceive={actionReceive} />
    <AmountRow amount={amount} styles={styles} theme={theme} />
    <ReasonRow reason={reason} styles={styles} />
  </Section.Stack>
)

const getStylesFromProps = ({ theme }) => {
  return {
    tableRow: {
      // TODO: see where should we take this color from
      borderBottomColor: theme.colors.gray50Percent,
      borderBottomWidth: 1,
      borderBottomStyle: 'solid',
      marginTop: theme.sizes.defaultDouble,
      alignItems: 'flex-end',
      paddingBottom: theme.sizes.defaultHalf,
      height: 40,
    },

    // TODO: all this properties can be removed once we merge Text component in
    tableRowLabel: {
      color: theme.colors.gray80Percent,
    },
    bigGoodDollar: {
      color: theme.colors.primary,
      fontSize: normalize(24),
      fontFamily: theme.fonts.default,
      fontWeight: '700',
    },
    bigGoodDollarUnit: {
      color: theme.colors.primary,
      fontSize: normalize(14),
      fontFamily: theme.fonts.default,
      fontWeight: '700',
    },
    reason: {
      fontSize: normalize(16),
    },
  }
}

export default withStyles(getStylesFromProps)(SummaryTable)
