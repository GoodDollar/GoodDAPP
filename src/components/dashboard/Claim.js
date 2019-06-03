// @flow
import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import type { Store } from 'undux'
import goodWallet from '../../lib/wallet/GoodWallet'
import wrapper from '../../lib/undux/utils/wrapper'
import GDStore from '../../lib/undux/GDStore'
import { BigNumber, CustomButton, Section, TopBar, Wrapper } from '../common'
import { weiToMask } from '../../lib/wallet/utils'
import logger from '../../lib/logger/pino-logger'
import type { DashboardProps } from './Dashboard'

type ClaimProps = DashboardProps & {
  store: Store
}

const log = logger.child({ from: 'Claim' })

class Claim extends Component<ClaimProps, {}> {
  state = {
    loading: false
  }

  goodWalletWrapped = wrapper(goodWallet, this.props.store)

  async componentDidMount() {
    //if we returned from facerecoginition then the isValid param would be set
    //this happens only on first claim
    const isValid = this.props.screenProps.screenState && this.props.screenProps.screenState.isValid
    if (isValid && (await goodWallet.isCitizen())) {
      this.handleClaim()
    } else if (isValid === false) {
      this.props.screenProps.goToRoot()
    }
  }

  handleClaim = async () => {
    this.setState({ loading: true })
    try {
      await this.goodWalletWrapped.claim()
      this.props.store.set('currentScreen')({
        dialogData: {
          visible: true,
          title: 'Success',
          message: `You've claimed your G$`,
          dismissText: 'YAY!',
          onDismiss: this.props.screenProps.goToRoot
        }
      })
      this.setState({ loading: false })
    } catch (e) {
      log.error('claiming failed', e)
      this.setState({ loading: false })
    }
  }

  faceRecognition = () => {
    this.props.screenProps.push('FaceRecognition', { from: 'Claim' })
  }

  render() {
    const { screenProps, store }: ClaimProps = this.props
    const { entitlement } = store.get('account')
    const isCitizen = store.get('isLoggedInCitizen')
    const ClaimButton = (
      <CustomButton
        disabled={entitlement <= 0}
        mode="contained"
        compact={true}
        onPress={() => {
          isCitizen ? this.handleClaim() : this.faceRecognition()
        }}
        style={styles.claimButton}
        loading={this.state.loading}
      >
        {`CLAIM YOUR SHARE - ${weiToMask(entitlement, { showUnits: true })}`}
      </CustomButton>
    )

    return (
      <Wrapper>
        <TopBar push={screenProps.push} />
        <Section style={styles.mainContent}>
          <Section.Text>GoodDollar allows you to collect</Section.Text>
          <Section.Text>
            <Text>G$s</Text>
            <Text style={styles.everyDay}> every day</Text>
          </Section.Text>
        </Section>
        {ClaimButton}
        <View />
      </Wrapper>
    )
  }
}

const styles = StyleSheet.create({
  claimButton: { flexGrow: 0, flexShrink: 1 },
  centered: {
    justifyContent: 'center',
    alignItems: 'baseline'
  },
  mainContent: { flexGrow: 1, justifyContent: 'center', backgroundColor: 'none' },
  everyDay: { fontSize: normalize(20) }
})

const claim = GDStore.withStore(Claim)
claim.navigationOptions = { title: 'Claim G$' }

export default claim
