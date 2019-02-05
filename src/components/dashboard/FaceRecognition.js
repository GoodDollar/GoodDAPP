// @flow
import React from 'react'
import goodWallet from '../../lib/wallet/GoodWallet'
import { StyleSheet, Text, View } from 'react-native'
import { Title, Description } from '../signup/components'
import { normalize } from 'react-native-elements'
import logger from '../../lib/logger/pino-logger'
import { Button, Modal, Portal } from 'react-native-paper'

const log = logger.child({ from: 'FaceRecognition' })

type Props = {
  screenProps: any
}
type State = {
  displayModal: boolean
}

class FaceRecognition extends React.Component<Props, State> {
  state = {
    displayModal: false
  }

  handleSubmit = () => {
    this.props.screenProps.doneCallback({ isEmailConfirmed: true })
  }

  logData = e => {
    this.setState({ displayModal: false })
    log.info(e)
  }

  handleClaim = async () => {
    try {
      const hasClaimed = await goodWallet.claim()
      log.info('handleClaim', hasClaimed)

      if (hasClaimed) {
        this.setState({ displayModal: true })
      }
    } catch (e) {
      log.warn(e)
    }
  }

  render() {
    this.props.screenProps.data = { name: 'John' }
    const { displayModal } = this.state
    return (
      <Portal.Host>
        <Title>{`${this.props.screenProps.data.name},\n Just one last thing...`}</Title>
        <Description style={styles.description}>
          {"In order to give you a basic income we need to make sure it's really you"}
        </Description>
        <Button
          onPress={this.handleClaim}
          screenProps={this.props.screenProps}
          style={[styles.buttonLayout, styles.signUpButton]}
        >
          <Text style={[styles.buttonText]}>QUICK FACE RECOGNITION</Text>
        </Button>
        <Portal>
          <Modal onDismiss={this.logData} visible={displayModal} dismissable={true}>
            <View style={{ border: '10px solid red', background: 'white' }}>
              <Text>SUCCESS!</Text>
              <Text>(icon)</Text>
              <Text>{`You've claimed your GD`}</Text>
              <Button onPress={() => this.setState({ displayModal: false })}>YAY!</Button>
            </View>
          </Modal>
        </Portal>
      </Portal.Host>
    )
  }
}

const styles = StyleSheet.create({
  description: {
    fontSize: normalize(20)
  }
})

export default FaceRecognition
