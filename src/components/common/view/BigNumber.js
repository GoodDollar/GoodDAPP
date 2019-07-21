// @flow
import React from 'react'
import { View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { withStyles } from '../../../lib/styles'
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
      marginRight: theme.sizes.defaultHalf,
      textAlign: 'right',
      lineHeight: 'auto',
    },
    bigNumberUnit: {
      fontFamily: theme.fonts.bold,
      fontSize: normalize(22),
      fontWeight: '700',
      textAlign: 'right',
      lineHeight: 'auto',
    },
  }
}

export default withStyles(getStylesFromProps)(BigNumber)
