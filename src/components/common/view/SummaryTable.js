import React from 'react'
import Section from '../layout/Section'
import { withStyles } from '../../../lib/styles'
import BigGoodDollar from './BigGoodDollar'

const WhoRow = ({ styles, counterPartyDisplayName, actionReceive, marginTop }) =>
  counterPartyDisplayName ? (
    <Section.Row style={[styles.tableRow, { marginTop }]}>
      <Section.Text fontSize={14} color="gray80Percent">
        {actionReceive ? 'From:' : 'To:'}
      </Section.Text>
      <Section.Text fontSize={24}>{counterPartyDisplayName}</Section.Text>
    </Section.Row>
  ) : null

const AmountRow = ({ amount, styles, marginTop }) =>
  amount ? (
    <Section.Row style={[styles.tableRow, { marginTop }]}>
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
  ) : null

const ReasonRow = ({ reason, styles, marginTop }) =>
  reason ? (
    <Section.Row style={[styles.tableRow, { marginTop }]}>
      <Section.Text fontSize={14} color="gray80Percent">
        For:
      </Section.Text>
      <Section.Text fontSize={14} numberOfLines={2} ellipsizeMode="tail" style={styles.reasonText}>
        {reason}
      </Section.Text>
    </Section.Row>
  ) : null

/**
 *
 * @param {any} props.styles injected via `withStyles`
 * @param {String} props.counterPartyDisplayName
 * @param {String} props.amount
 * @param {Boolean} props.actionReceive if true text is for receive summary
 * @param {Boolean} props.compact if true each row uses less margins
 */
const SummaryTable = ({ styles, counterPartyDisplayName, amount, reason, actionReceive, theme, compact }) => {
  const marginTop = compact ? theme.sizes.defaultHalf : theme.sizes.defaultDouble
  return (
    <Section.Stack grow justifyContent="center">
      <WhoRow
        counterPartyDisplayName={counterPartyDisplayName}
        styles={styles}
        actionReceive={actionReceive}
        marginTop={marginTop}
      />
      <AmountRow amount={amount} styles={styles} marginTop={marginTop} />
      <ReasonRow reason={reason} styles={styles} marginTop={marginTop} />
    </Section.Stack>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    reasonText: {
      textAlign: 'right',
      marginLeft: 10,
      color: theme.colors.darkGray,
    },
    tableRow: {
      // TODO: see where should we take this color from
      borderBottomColor: theme.colors.gray50Percent,
      borderBottomWidth: 1,
      borderStyle: 'solid',
      alignItems: 'flex-end',
      paddingBottom: theme.sizes.defaultHalf,
      height: 40,
    },
  }
}

export default withStyles(getStylesFromProps)(SummaryTable)
