// @flow
import React from 'react'
import goodWallet from '../../lib/wallet/GoodWallet'
import { StyleSheet, Text, View } from 'react-native'
import { Title, Description } from '../signup/components'
import { normalize } from 'react-native-elements'
import logger from '../../lib/logger/pino-logger'
import { Button, Modal, Portal, Dialog, Paragraph } from 'react-native-paper'
import { Wrapper, NextButton } from '../common'

const log = logger.child({ from: 'FaceRecognition' })

type Props = {
  screenProps: any
}
type State = {
  dialogVisible: boolean,
  dialogData: any
}

class FaceRecognition extends React.Component<Props, State> {
  state = {
    dialogVisible: false,
    dialogData: {}
  }

  handleSubmit = () => {
    this.props.screenProps.doneCallback({ isEmailConfirmed: true })
  }

  handleClaim = async () => {
    try {
      await goodWallet.claim()
      this.setState({
        dialogVisible: true,
        dialogData: { title: 'Success', message: `You've claimed your GD`, dismissText: 'YAY!' }
      })
    } catch (e) {
      log.warn('estoooo0', e)
      this.setState({ dialogVisible: true, dialogData: { title: 'Error', message: e.message } })
    }
  }

  _handleDismissDialog = () => {
    const { title } = this.state.dialogData
    this.setState({
      dialogData: {},
      dialogVisible: false
    })
    // TODO: Improve this flow
    if (title === 'Success') this.props.screenProps.pop()
  }

  render() {
    this.props.screenProps.data = { name: 'John' }
    const { dialogVisible, dialogData } = this.state
    return (
      <Wrapper>
        <View style={styles.topContainer}>
          <Title>{`${this.props.screenProps.data.name},\n Just one last thing...`}</Title>
          <Description style={styles.description}>
            {"In order to give you a basic income we need to make sure it's really you"}
          </Description>
        </View>
        <View style={styles.bottomContainer}>
          <NextButton onPress={this.handleClaim}>Quick Face Recognition</NextButton>
        </View>

        <Portal>
          <Dialog visible={dialogVisible} onDismiss={this._handleDismissDialog} dismissable={true}>
            <Dialog.Title>{dialogData.title}</Dialog.Title>
            <Dialog.Content>
              <Paragraph>{dialogData.message}</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={this._handleDismissDialog}>{dialogData.dismissText || 'Done'}</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </Wrapper>
    )
  }
}

const styles = StyleSheet.create({
  topContainer: {
    display: 'flex',
    flex: 1,
    justifyContent: 'space-evenly',
    paddingTop: normalize(30)
  },
  bottomContainer: {
    display: 'flex',
    flex: 1,
    paddingTop: normalize(20),
    justifyContent: 'flex-end'
  }
})

export default FaceRecognition
