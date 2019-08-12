// @flow
import React from 'react'
import { View } from 'react-native'
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
    const { bigNumberStyles, bigNumberUnitStyles, number, unit, style, color, styles } = this.props
    return (
      <View style={[styles.bigNumberWrapper, style]}>
        <Text
          fontFamily="slab"
          fontSize={36}
          fontWeight="700"
          textAlign="right"
          color={color || 'gray'}
          style={[styles.bigNumber, bigNumberStyles]}
        >
          {number}
        </Text>
        <Text
          fontFamily="slab"
          fontSize={18}
          fontWeight="700"
          textAlign="right"
          color={color || 'gray'}
          style={bigNumberUnitStyles}
        >
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
      marginRight: 2,
    },
  }
}

export default withStyles(getStylesFromProps)(BigNumber)
