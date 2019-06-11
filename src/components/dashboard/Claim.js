// @flow
import React, { Component } from 'react'
import { Image, StyleSheet, View, Text } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import type { Store } from 'undux'
import goodWallet from '../../lib/wallet/GoodWallet'
import wrapper from '../../lib/undux/utils/wrapper'
import GDStore from '../../lib/undux/GDStore'
import { BigNumber, BigGoodDollar, Section, TopBar, Wrapper, CustomButton } from '../common'
import { weiToMask } from '../../lib/wallet/utils'
import type { DashboardProps } from './Dashboard'
import logger from '../../lib/logger/pino-logger'

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
    this.interval = setInterval(async () => {
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
      const receipt = await this.goodWalletWrapped.claim()
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
        onPress={async () => {
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
        <Section style={styles.nextIncome}>
          <Section.Text>
            {claimedToday.people} PEOPLE CLAIMED {claimedToday.amount} G$ TODAY!
          </Section.Text>
        </Section>
        <Section style={styles.nextIncome}>
          <Section.Text style={styles.incomeTitle}>Next daily income:</Section.Text>
          <Section.Text style={styles.time}>{nextClaim}</Section.Text>
        </Section>
        {ClaimButton}
        <View />
      </Wrapper>
    )
  }
}

const styles = StyleSheet.create({
  claimButton: {
    flexGrow: 0,
    flexShrink: 1
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'baseline'
  },
  mainContent: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: 'none'
  },
  nextIncome: {
    justifyContent: 'center'
  },
  incomeTitle: {
    fontSize: normalize(18),
    textTransform: 'uppercase',
    fontFamily: 'Roboto, Regular'
  },
  time: {
    fontSize: normalize(36),
    fontFamily: 'Roboto, Medium'
  },
  everyDay: {
    fontSize: normalize(20)
  }
})

const claim = GDStore.withStore(Claim)
claim.navigationOptions = {
  title: 'Claim G$'
}

export default claim
