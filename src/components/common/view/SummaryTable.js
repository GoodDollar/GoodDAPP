import React from 'react'
import normalize from '../../../lib/utils/normalizeText'
import Section from '../layout/Section'
import { withStyles } from '../../../lib/styles'
import BigGoodDollar from './BigGoodDollar'

const WhoRow = ({ styles, counterPartyDisplayName, actionReceive, marginTop }) => {
  if (!counterPartyDisplayName) {
    return null
  }

  return (
    <Section.Row style={[styles.tableRow, { marginTop }]}>
      <Section.Text fontSize={14} color="gray80Percent">
        {actionReceive ? 'From:' : 'To:'}
      </Section.Text>
      <Section.Text fontSize={24}>{counterPartyDisplayName}</Section.Text>
    </Section.Row>
  )
}

const AmountRow = ({ amount, styles, marginTop, theme }) => {
  if (!amount) {
    return null
  }
  return (
    <Section.Row style={[styles.tableRow, { marginTop }]}>
      <Section.Text fontSize={14} color="gray80Percent">
        Amount:
      </Section.Text>
      <BigGoodDollar
        bigNumberStyles={styles.bigGoodDollar}
        bigNumberUnitStyles={styles.bigGoodDollarUnit}
        number={amount}
        color={theme.colors.primary}
      />
    </Section.Row>
  )
}

const ReasonRow = ({ reason, styles, marginTop }) => {
  if (!reason) {
    return null
  }
  return (
    <Section.Row style={[styles.tableRow, { marginTop }]}>
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
      <AmountRow amount={amount} styles={styles} theme={theme} marginTop={marginTop} />
      <ReasonRow reason={reason} styles={styles} marginTop={marginTop} />
    </Section.Stack>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    tableRow: {
      // TODO: see where should we take this color from
      borderBottomColor: theme.colors.gray50Percent,
      borderBottomWidth: 1,
      borderBottomStyle: 'solid',
      alignItems: 'flex-end',
      paddingBottom: theme.sizes.defaultHalf,
      height: 40,
    },

    // TODO: all this properties can be removed once we merge Text component in
    bigGoodDollar: {
      color: theme.colors.primary,
      fontSize: normalize(24),
      fontFamily: theme.fonts.default,
    },
    bigGoodDollarUnit: {
      color: theme.colors.primary,
      fontSize: normalize(14),
      fontFamily: theme.fonts.default,
    },
  }
}

export default withStyles(getStylesFromProps)(SummaryTable)
