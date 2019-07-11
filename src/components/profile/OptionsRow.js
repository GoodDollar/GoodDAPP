// @flow
import startCase from 'lodash/startCase'
import React from 'react'
import { View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { RadioButton } from 'react-native-paper'
import { withStyles } from '../../lib/styles'
import { Text } from '../common'

// privacy options
const privacyOptions = ['private', 'masked', 'public']

/**
 * OptionsRow component
 * @param {object} props
 * @param {string} props.title
 * @param {object} props.styles
 * @returns {React.Node}
 * @constructor
 */
const OptionsRow = ({ title = '', styles, theme }) => (
  <View style={styles.optionsRowContainer}>
    <Text style={styles.growTwo} textAlign="left" fontSize={16}>
      {title}
    </Text>

    {privacyOptions.map(privacy => (
      <View style={styles.optionsRowTitle} key={privacy}>
        {title === '' ? (
          <Text>{startCase(privacy)}</Text>
        ) : (
          <RadioButton value={privacy} uncheckedColor={theme.colors.darkGray} color={theme.colors.primary} />
        )}
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
      borderBottomStyle: 'solid',
      borderBottomColor: theme.colors.lightGray,
      borderBottomWidth: normalize(2),
      padding: theme.paddings.mainContainerPadding
    },
    growTwo: {
      flexGrow: 2
    },
    optionsRowTitle: {
      width: '15%',
      alignItems: 'center'
    }
  }
}

export default withStyles(getStylesFromProps)(OptionsRow)
