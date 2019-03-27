// @flow
import React from 'react'
import { View, StyleSheet, Text, TouchableHighlight } from 'react-native'
import { normalize } from 'react-native-elements'
import { Avatar } from '../common'
import Modal from 'modal-react-native-web'

export type ModalProps = {
  visible: boolean,
  title: string,
  toggleModal: any,
  screenProps: any,
  addressee: string
}

const ModalSlider = (props: ModalProps) => {
  const { visible, title, toggleModal, screenProps, addressee } = props
  return (
    <Modal visible={visible}>
      <View style={styles.modal}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.hrLine} />
        <View style={styles.profileRow}>
          <Avatar size={40} onPress={() => screenProps.push('Profile')} />
          <Text style={styles.label}>To:</Text>
          <Text style={styles.name}>{addressee}</Text>
        </View>
        <View style={styles.hrLine} />
        <TouchableHighlight onPress={toggleModal}>
          <Text>Hide Modal</Text>
        </TouchableHighlight>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: normalize(4),
    borderLeftWidth: normalize(10),
    borderRightWidth: normalize(2),
    borderTopWidth: normalize(2),
    borderBottomWidth: normalize(2),
    padding: normalize(30),
    borderColor: '#c9c8c9'
  },
  hrLine: {
    borderBottomColor: '#c9c8c9',
    borderBottomWidth: normalize(1),
    width: '100%',
    marginBottom: normalize(10),
    marginTop: normalize(10)
  },
  title: {
    fontFamily: 'Helvetica, "sans-serif"',
    fontSize: normalize(16),
    color: 'black',
    fontWeight: 'bold'
  },
  label: {
    fontFamily: 'Helvetica, "sans-serif"',
    fontSize: normalize(10),
    color: 'black',
    display: 'inlineBlock'
  },
  name: {
    fontFamily: 'Helvetica, "sans-serif"',
    fontSize: normalize(14),
    color: 'black',
    display: 'inlineBlock'
  },
  profileRow: {
    alignItems: 'stretch'
  }
})

export default ModalSlider
