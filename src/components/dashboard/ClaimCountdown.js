import React from 'react'
import { withStyles } from '../../lib/styles'
import Section from '../common/layout/Section'

const Countdown = ({ styles, nextClaim }) => (
  <Section.Stack style={styles.extraInfoCountdown}>
    <Section.Text style={styles.extraInfoCountdownTitle}>Next Daily Income:</Section.Text>
    <Section.Text color="surface" fontFamily="slab" fontSize={36} fontWeight="bold">
      {nextClaim}
    </Section.Text>
  </Section.Stack>
)

const getStylesFromProps = ({ theme }) => {
  const defaultMargins = {
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: theme.sizes.default,
  }

  const defaultPaddings = {
    paddingVertical: theme.sizes.default,
    paddingHorizontal: theme.sizes.defaultHalf,
  }

  const defaultStatsBlock = {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.sizes.borderRadius,
  }

  return {
    extraInfoCountdown: {
      ...defaultStatsBlock,
      ...defaultPaddings,
      ...defaultMargins,
      backgroundColor: theme.colors.orange,
      flexGrow: 2,
      flexDirection: 'column',
    },
    extraInfoCountdownTitle: {
      marginBottom: theme.sizes.default,
    },
  }
}

export default withStyles(getStylesFromProps)(Countdown)
