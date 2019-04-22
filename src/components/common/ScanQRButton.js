// @flow
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { normalize } from 'react-native-elements'
import { Avatar, Text } from 'react-native-paper'

type Props = {
  disabled?: boolean,
  style?: { row?: {}, icon?: {}, legendWrapper?: {}, legend?: {} },
  onPress: any
}

const ScanQRButton = ({ onPress, ...screenProps }: Props) => {
  const { disabled, style = {} } = screenProps
  return (
    <View style={[styles.row, style.row]} onClick={!disabled ? onPress : undefined}>
      <Avatar.Icon size={48} style={[styles.icon, style.icon]} icon="code" />
      <Text style={[styles.legendWrapper, style.legendWrapper]}>
        <Text style={[styles.legend, style.legend]}>Scan QR Code</Text>
      </Text>
    </View>
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
    fontFamily: 'Helvetica, "sans-serif"',
    fontSize: normalize(14),
    color: 'black',
    display: 'inlineBlock'
  }
})

export default ScanQRButton
