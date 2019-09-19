import React from 'react'
import { withStyles } from '../../lib/styles'
import Section from '../common/layout/Section'

const Countdown = ({ styles, nextClaim }) => {
  const propsForText = {
    color: 'surface',
    fontFamily: 'slab',
    fontSize: 36,
    fontWeight: 'bold',
  }

  return (
    <Section.Stack style={styles.extraInfoCountdown}>
      <Section.Text style={styles.extraInfoCountdownTitle}>Next Daily Income:</Section.Text>
      <Section.Row>
        <Section.Text {...propsForText} style={styles.numberWidth}>
          {nextClaim[0]}
        </Section.Text>
        <Section.Text {...propsForText} style={styles.numberWidth}>
          {nextClaim[1]}
        </Section.Text>
        <Section.Text {...propsForText} style={styles.dots}>
          :
        </Section.Text>
        <Section.Text {...propsForText} style={styles.numberWidth}>
          {nextClaim[3]}
        </Section.Text>
        <Section.Text {...propsForText} style={styles.numberWidth}>
          {nextClaim[4]}
        </Section.Text>
        <Section.Text {...propsForText} style={styles.dots}>
          :
        </Section.Text>
        <Section.Text {...propsForText} style={styles.numberWidth}>
          {nextClaim[6]}
        </Section.Text>
        <Section.Text {...propsForText} style={styles.numberWidth}>
          {nextClaim[7]}
        </Section.Text>
      </Section.Row>
    </Section.Stack>
  )
}

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
    numberWidth: {
      width: 25,
    },
    dots: {
      width: 15,
    },
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
