// @flow
import React from 'react'
import { Modal, View, StyleSheet, Text } from 'react-native'
import { normalize } from 'react-native-elements'
import { Section, Wrapper } from '../common'
// import Modal from 'react-native-modal'

export type ModalProps = {
  visible: boolean,
  title: string,
  toggleModal: any
}

const ModalSlider = (props: ModalProps) => {
  const { visible, title, toggleModal } = props
  return (
    <View>
      {visible && (
        <Modal isVisible={visible} onBackdropPress={toggleModal}>
          <View style={styles.modal}>
            <Wrapper>
              <Section>
                <Section.Row style={styles.centered}>
                  <Section.Title>{title}</Section.Title>
                </Section.Row>
                <Section.Row style={styles.hrLine} />
              </Section>
            </Wrapper>
          </View>
        </Modal>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    alignItems: 'center',
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
    borderBottomWidth: normalize(1)
  }
})

export default ModalSlider
