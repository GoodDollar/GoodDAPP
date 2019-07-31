// @flow
import React from 'react'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import normalize from '../../../lib/utils/normalizeText'
import Text from './Text'

/**
 * Receives a number and a unit to display
 * @param {Props} props
 * @param {Number} [props.number] Number to show
 * @param {String} [props.unit] Units for the number
 * @param {Object} [props.elementStyles] Inner elements styles
 * @param {Object} [props.style] Outer element style
 * @returns {React.Node}
 */
class BigNumber extends React.Component {
  render() {
    const { bigNumberStyles, bigNumberUnitStyles, number, unit, style, color, theme, styles } = this.props
    return (
      <View style={[styles.bigNumberWrapper, style]}>
        <Text style={[styles.bigNumber, bigNumberStyles, { color: color || theme.fontStyle.color }]}>{number}</Text>
        <Text style={[styles.bigNumberUnit, bigNumberUnitStyles, { color: color || theme.fontStyle.color }]}>
          {unit}
        </Text>
      </View>
    )
  }
}

const getStylesFromProps = ({ theme }) => {
  return {
    bigNumberWrapper: {
      alignItems: 'baseline',
      display: 'flex',
      flexDirection: 'row',
    },
    bigNumber: {
      fontFamily: theme.fonts.bold,
      fontSize: normalize(36),
      fontWeight: '700',
      marginRight: 2,
      textAlign: 'right',
    },
    bigNumberUnit: {
      fontFamily: theme.fonts.bold,
      fontSize: normalize(18),
      fontWeight: '700',
      textAlign: 'right',
    },
  }
}

export default withStyles(getStylesFromProps)(BigNumber)
