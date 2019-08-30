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
class Circle extends React.Component {
  render() {
    const { children, number, styles } = this.props
    return (
      <View style={styles.mainBlock}>
        <View style={styles.circle}>
          <Text
            fontFamily="slab"
            fontSize={normalize(24)}
            // fontWeight="bold"
            color="#ffffff"
          >
            {number}
          </Text>
        </View>
        <View style={styles.text}>
          <Text fontFamily="Roboto" fontSize={normalize(18)} color="#42454A">
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
      alignItems: 'baseline',
      display: 'flex',
      flexDirection: 'row',
    },
    circle: {
      alignItems: 'center',
      backgroundColor: theme.colors.darkGray,
      color: '#fff',
      borderRadius: '50%',
      height: 43,
      padding: 5,
      boxShadow: '6px 1px 0 rgba(12, 38, 61, 0.15)',
      marginTop: 10,
      width: 43,
    },
    text: {
      paddingLeft: 13,
    },
  }
}

export default withStyles(getStylesFromProps)(Circle)
