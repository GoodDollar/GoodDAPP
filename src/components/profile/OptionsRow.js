// @flow
import startCase from 'lodash/startCase'
import React from 'react'
import { View } from 'react-native'
import { RadioButton } from 'react-native-paper'
import { withStyles } from '../../lib/styles'
import { Text } from '../common'

// privacy options
const privacyOptions = ['private', 'masked', 'public']

/**
 * OptionsRow component
 * @param title
 * @returns {React.Node}
 * @constructor
 */
const OptionsRow = ({ title = '', styles }) => (
  <View style={styles.optionsRowContainer}>
    <Text style={styles.growTwo}>{title}</Text>

    {privacyOptions.map(privacy => (
      <View style={styles.optionsRowTitle} key={privacy}>
        {title === '' ? <Text>{startCase(privacy)}</Text> : <RadioButton value={privacy} />}
      </View>
    ))}
  </View>
)

const getStylesFromProps = ({ theme }) => {
  return {
    optionsRowContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomColor: theme.colors.lightGray,
      borderBottomStyle: 'solid',
      borderBottomWidth: 1,
      padding: '10px',
    },
    growTwo: {
      flexGrow: 2,
    },
    optionsRowTitle: {
      width: '15%',
      alignItems: 'center',
    },
  }
}

export default withStyles(getStylesFromProps)(OptionsRow)
