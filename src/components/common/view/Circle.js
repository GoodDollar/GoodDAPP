// @flow
import React from 'react'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import { theme } from '../../theme/styles'
import Text from './Text'
import { Platform } from 'react-native'

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
    const { children, number, styles } = this.props
    return (
      <View style={styles.mainBlock}>
        <View style={styles.circle}>
          <Text fontFamily="slab" style={styles.circleNumber} fontWeight="bold" fontSize={20}>
            {number}
          </Text>
        </View>
        <View style={styles.text}>
          <Text fontFamily="Roboto" fontSize={18} color={theme.colors.darkGray}>
            {children}
          </Text>
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
    circleNumber: {
      display: Platform.OS === 'web' ? 'block' : 'flex',
      flex: 1,
      zIndex: 9999999,
      color: '#ffffff',
    },
    circle: {
      justifyContent: 'center',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.darkGray,
      borderRadius: 50,
      height: 35,
      shadowColor: 'rgb(12, 38, 61)',
      shadowOpacity: 0.25,
      shadowOffset: {
        width: 6,
        height: 1,
      },
      marginTop: theme.sizes.default,
      width: 35,
    },
    text: {
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingLeft: 13,
    },
  }
}

export default withStyles(getStylesFromProps)(Circle)
