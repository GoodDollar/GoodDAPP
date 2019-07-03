// @flow
import React, { Component } from 'react'
import { StyleSheet } from 'react-native'
import { normalize } from 'react-native-elements'
import goodWallet from '../../lib/wallet/GoodWallet'
import wrapper from '../../lib/undux/utils/wrapper'
import GDStore from '../../lib/undux/GDStore'
import { CustomButton, Section, Text, TopBar, Wrapper } from '../common'
import { weiToMask } from '../../lib/wallet/utils'
import logger from '../../lib/logger/pino-logger'
import type { DashboardProps } from './Dashboard'

type ClaimProps = DashboardProps & {
  store: Store
}

type ClaimState = {
  loading: boolean,
  nextClaim: string,
  claimedToday: any
}

const log = logger.child({ from: 'Claim' })

class Claim extends Component<ClaimProps, ClaimState> {
  state = {
    loading: false,
    nextClaim: '23:59:59',
    claimedToday: {
      people: '',
      amount: ''
    }
  }

  interval = null

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

    const { entitlement } = this.props.store.get('account')
    const [claimedToday, nextClaimDate] = await Promise.all([
      this.goodWalletWrapped.getAmountAndQuantityClaimedToday(entitlement),
      this.goodWalletWrapped.getNextClaimTime()
    ])
    this.setState({ claimedToday })
    this.interval = setInterval(() => {
      const nextClaim = new Date(nextClaimDate - new Date().getTime()).toISOString().substr(11, 8)
      this.setState({ nextClaim })
    }, 1000)
  }

  componentWillUnmount() {
    clearInterval(this.interval)
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
    const { nextClaim, claimedToday } = this.state

    const ClaimButton = (
      <CustomButton
        disabled={entitlement <= 0}
        mode="contained"
        compact={true}
        onPress={() => {
          isCitizen ? this.handleClaim() : this.faceRecognition()
        }}
        loading={this.state.loading}
      >
        {`CLAIM YOUR SHARE - ${weiToMask(entitlement, { showUnits: true })}`}
      </CustomButton>
    )

    return (
      <Wrapper>
        <TopBar push={screenProps.push} />
        <Section.Stack grow={3} justifyContent="flex-start">
          <Text style={styles.description}>GoodDollar allows you to collect</Text>
          <Section.Row justifyContent="center">
            <Text style={styles.descriptionPunch}>1</Text>
            <Text style={[styles.descriptionPunch, styles.descriptionPunchCurrency]}> G$</Text>
            <Text style={[styles.descriptionPunch, styles.noTransform]}> Free</Text>
          </Section.Row>
          <Section.Row justifyContent="center">
            <Text style={[styles.descriptionPunch, styles.noTransform]}>Every Day</Text>
          </Section.Row>
        </Section.Stack>
        <Section grow={3} style={styles.extraInfo}>
          <Section.Row grow={1} style={styles.extraInfoStats} justifyContent="center">
            <Section.Row alignItems="baseline">
              <Text color="primary" weight="bold">
                {claimedToday.people}
              </Text>
              <Text> People Claimed </Text>
              <Text color="primary" weight="bold">
                {claimedToday.amount}{' '}
              </Text>
              <Text color="primary" size={12} weight="bold">
                G$
              </Text>
              <Text> Today!</Text>
            </Section.Row>
          </Section.Row>
          <Section.Stack grow={3} style={styles.extraInfoCountdown} justifyContent="center">
            <Text>Next daily income:</Text>
            <Text style={styles.extraInfoCountdownClock}>{nextClaim}</Text>
          </Section.Stack>
          {ClaimButton}
        </Section>
      </Wrapper>
    )
  }
}

const styles = StyleSheet.create({
  description: { fontSize: normalize(16), color: '#ffffff' },
  descriptionPunch: { fontFamily: 'RobotoSlab-Bold', fontSize: normalize(36), color: '#ffffff' },
  descriptionPunchCurrency: { fontSize: normalize(20) },
  noTransform: { textTransform: 'none' },
  extraInfo: { marginBottom: 0, padding: normalize(8), paddingTop: normalize(8), paddingBottom: normalize(8) },
  valueHighlight: { fontWeight: 'bold', color: '#00afff' },
  extraInfoStats: { backgroundColor: '#e0e0e0', borderRadius: normalize(5) },
  extraInfoStatsCurrency: { fontSize: normalize(12) },
  extraInfoCountdown: {
    backgroundColor: '#e0e0e0',
    marginTop: normalize(8),
    marginBottom: normalize(16),
    borderRadius: normalize(5)
  },
  extraInfoCountdownClock: { fontSize: normalize(36), color: '#00c3ae', fontFamily: 'RobotoSlab-Bold' }
})

const claim = GDStore.withStore(Claim)

claim.navigationOptions = {
  title: 'Claim Daily G$'
}

export default claim
