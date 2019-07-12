// @flow
import React from 'react'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import KeyboardKey from './KeyboardKey'

type KeyboardRowProps = {
  onPress: string => void,
  keys: Array<string>,
}

const KeyboardRow = ({ keys, onPress, styles }: KeyboardRowProps) => (
  <View style={styles.row}>
    {keys.map(key => (
      <KeyboardKey keyValue={key} onPress={onPress} key={key} />
    ))}
  </View>
)

const getStylesFromProps = ({ theme }) => {
  return {
    row: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  }
}

export default withStyles(getStylesFromProps)(KeyboardRow)
