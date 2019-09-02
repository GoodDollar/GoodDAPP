import React from 'react'
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
      <Section.Text fontSize={14} color="gray80Percent">
        {actionReceive ? 'From:' : 'To:'}
      </Section.Text>
      <Section.Text fontSize={24}>{counterPartyDisplayName}</Section.Text>
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
      <Section.Text fontSize={14} color="gray80Percent">
        Amount:
      </Section.Text>
      <BigGoodDollar
        number={amount}
        color="primary"
        bigNumberProps={{ fontSize: 24 }}
        bigNumberUnitProps={{ fontSize: 14 }}
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
      <Section.Text fontSize={14} color="gray80Percent">
        For:
      </Section.Text>
      <Section.Text fontSize={14}>{reason}</Section.Text>
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
  }
}

export default withStyles(getStylesFromProps)(SummaryTable)
