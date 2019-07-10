// @flow
import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { Avatar } from 'react-native-paper'
import Text from '../view/Text'

type Props = {
  disabled?: boolean,
  style?: { row?: {}, icon?: {}, legendWrapper?: {}, legend?: {} },
  onPress: any
}

const ScanQRButton = ({ onPress, ...screenProps }: Props) => {
  const { disabled, style = {} } = screenProps
  return (
    <TouchableOpacity style={[styles.row, style.row]} onPress={disabled ? undefined : onPress}>
      <Avatar.Icon size={48} style={[styles.icon, style.icon]} icon="code" />
      <Text style={[styles.legendWrapper, style.legendWrapper]}>
        <Text style={[styles.legend, style.legend]}>Scan QR Code</Text>
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  row: {
    cursor: 'pointer',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 0
  },
  icon: {
    backgroundColor: 'white'
  },
  legendWrapper: {
    marginLeft: '10px'
  },
  legend: {
    fontSize: normalize(14),
    color: 'black',
    display: 'inlineBlock'
  }
})

export default ScanQRButton
