// @flow
import React from 'react'
import { Platform, View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import { theme } from '../../theme/styles'
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
    const {
      bigNumberStyles,
      bigNumberUnitStyles,
      bigNumberProps,
      bigNumberUnitProps,
      children,
      number,
      unit,
      style,
      color,
      styles,
      testID,
      reverse,
      spaceBetween = true,
    } = this.props

    const components = []

    if (reverse) {
      components.push(
        unit ? (
          <Text
            key="big_number_unit"
            fontFamily={theme.fonts.slab}
            fontSize={18}
            lineHeight={18}
            fontWeight="bold"
            textAlign="right"
            color={color || 'gray'}
            {...bigNumberUnitProps}
            style={bigNumberUnitStyles}
          >
            {unit}
          </Text>
        ) : (
          children
        ),
        spaceBetween ? <Text key="big_number_space"> </Text> : null,
        <Text
          key="big_number_amount"
          fontFamily={theme.fonts.slab}
          fontSize={36}
          lineHeight={36}
          fontWeight="bold"
          textAlign="right"
          color={color || 'gray'}
          {...bigNumberProps}
          style={[styles.bigNumber, bigNumberStyles]}
        >
          {number}
        </Text>,
      )
    } else {
      components.push(
        <Text
          key="big_number_amount"
          fontFamily={theme.fonts.slab}
          fontSize={36}
          fontWeight="bold"
          textAlign="right"
          color={color || 'gray'}
          lineHeight={36}
          {...bigNumberProps}
          style={[styles.bigNumber, bigNumberStyles]}
        >
          {number}
        </Text>,
        unit ? (
          <Text
            key="big_number_unit"
            fontFamily={theme.fonts.slab}
            fontSize={18}
            lineHeight={18}
            fontWeight="bold"
            textAlign="right"
            color={color || 'gray'}
            {...bigNumberUnitProps}
            style={bigNumberUnitStyles}
          >
            {unit}
          </Text>
        ) : (
          children
        ),
      )
    }

    return (
      <View style={[styles.bigNumberWrapper, style]} testID={testID}>
        {components}
      </View>
    )
  }
}

const getStylesFromProps = ({ theme }) => {
  return {
    bigNumberWrapper: {
      alignItems: Platform.select({ web: 'baseline', default: 'center' }),
      display: 'flex',
      flexDirection: 'row',
    },
    bigNumber: {
      marginRight: 2,
    },
  }
}

export default withStyles(getStylesFromProps)(BigNumber)
