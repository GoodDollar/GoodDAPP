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
class Circle extends React.Component {
  render() {
    const { children, number, subText, styles } = this.props
    return (
      <View style={[styles.mainBlock, !!subText && styles.alignMainBlockCenter]}>
        <View style={styles.circle}>
          <Text fontFamily="slab" style={styles.circleNumber} fontWeight="bold" fontSize={20}>
            {number}
          </Text>
        </View>
        <View style={styles.text}>
          <Text fontFamily="Roboto" fontSize={18} color={theme.colors.darkGray}>
            {children}
          </Text>
          {subText}
        </View>
      </View>
    )
  }
}

const getStylesFromProps = ({ theme }) => {
  return {
    mainBlock: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },
    alignMainBlockCenter: {
      alignItems: 'center',
    },
    circleNumber: {
      display: Platform.select({
        web: 'block',
        default: 'flex',
      }),
      flex: 1,
      zIndex: 9999999,
      color: '#ffffff',
    },
    circle: {
      justifyContent: 'center',
      display: 'flex',
      backgroundColor: theme.colors.primary,
      borderRadius: Platform.select({
        web: '50%',
        default: 43 / 2,
      }),
      ...Platform.select({
        web: {
          boxShadow: '6px 1px 0 rgba(12, 38, 61, 0.15)',
        },
      }),
      marginTop: theme.sizes.default,
      height: 43,
      width: 43,
    },
    text: {
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingLeft: 13,
    },
  }
}

export default withStyles(getStylesFromProps)(Circle)
