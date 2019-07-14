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
    const { elementStyles, number, unit, style, color, theme, styles } = this.props

    return (
      <View style={[styles.bigNumberWrapper, style]}>
        <Text style={[styles.bigNumber, elementStyles, { color: color || theme.fontStyle.color }]}>{number}</Text>
        <Text style={[styles.bigNumberUnit, elementStyles, { color: color || theme.fontStyle.color }]}>{unit}</Text>
      </View>
    )
  }
}

const getStylesFromProps = ({ theme }) => {
  return {
    bigNumberWrapper: {
      display: 'inline-block',
    },
    bigNumber: {
      ...theme.fontStyle,
      fontSize: normalize(48),
      textAlign: 'right',
    },
    bigNumberUnit: {
      ...theme.fontStyle,
      textAlign: 'right',
    },
  }
}

export default withStyles(getStylesFromProps)(BigNumber)
