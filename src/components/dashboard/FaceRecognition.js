// @flow
import React from 'react'
import goodWallet from '../../lib/wallet/GoodWallet'
import { StyleSheet, Text, View } from 'react-native'
import { Title, Description } from '../signup/components'
import { normalize } from 'react-native-elements'
import logger from '../../lib/logger/pino-logger'
import { Wrapper, CustomButton, CustomDialog } from '../common'
import wrapper from '../../lib/undux/utils/wrapper'

import GDStore from '../../lib/undux/GDStore'

const log = logger.child({ from: 'FaceRecognition' })

type Props = {
  screenProps: any,
  store: {}
}

class FaceRecognition extends React.Component<Props> {
  openEventInDashboard = receipt => () => {
    this.props.screenProps.navigateTo('Home', { event: receipt.transactionHash })
  }

  handleClaim = async () => {
    try {
      const goodWalletWrapped = wrapper(goodWallet, this.props.store)
      const receipt = await goodWalletWrapped.claim()
      this.props.store.set('currentScreen')({
        dialogData: {
          visible: true,
          title: 'Success',
          message: `You've claimed your GD`,
          dismissText: 'YAY!',
          onDismiss: this.openEventInDashboard(receipt)
        },
        loading: true
      })
    } catch (e) {
      log.warn('claiming failed', e)
    }
  }

  render() {
    const { fullName } = this.props.store.get('profile')
    return (
      <Wrapper>
        <View style={styles.topContainer}>
          <Title>{`${fullName},\n Just one last thing...`}</Title>
          <Description style={styles.description}>
            {"In order to give you a basic income we need to make sure it's really you"}
          </Description>
        </View>
        <View style={styles.bottomContainer}>
          <CustomButton
            mode="contained"
            onPress={this.handleClaim}
            loading={this.props.store.get('currentScreen').loading}
          >
            Quick Face Recognition
          </CustomButton>
        </View>
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

export default GDStore.withStore(FaceRecognition)
