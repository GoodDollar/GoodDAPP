// @flow
import React from 'react'
import { View } from 'react-native'
import { RadioButton } from 'react-native-paper'
import { startCase } from 'lodash'
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
    <Text style={styles.growTwo} textAlign="left" color="gray" fontWeight="medium">
      {title}
    </Text>

    {privacyOptions.map(privacy => (
      <View style={styles.optionsRowTitle} key={privacy}>
        {title === '' ? (
          <Text fontSize={14} color="gray">
            {startCase(privacy)}
          </Text>
        ) : (
          <RadioButton value={privacy} uncheckedColor={theme.colors.gray} color={theme.colors.primary} />
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
      borderStyle: 'solid',
      borderBottomColor: theme.colors.lightGray,
      borderBottomWidth: 1,
      padding: theme.paddings.mainContainerPadding,
      paddingLeft: theme.sizes.defaultQuadruple,
    },
    growTwo: {
      flexGrow: 2,
    },
    optionsRowTitle: {
      width: '15%',
      minWidth: 60,
      alignItems: 'center',
    },
  }
}

export default withStyles(getStylesFromProps)(OptionsRow)
