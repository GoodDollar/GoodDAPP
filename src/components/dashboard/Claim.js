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
const log = logger.child({ from: 'SendQRSummary' })

class Claim extends Component<ClaimProps, {}> {
  state = {
    loading: false,
    isCitizen: this.props.store.get('isLoggedInCitizen')
  }
  goodWalletWrapped = wrapper(goodWallet, this.props.store)
  async componentDidMount() {
    //returned from facerecoginition
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
    const ClaimButton = (
      <CustomButton
        // disabled={entitlement <= 0 && this.state.isCitizen}
        mode="contained"
        compact={true}
        onPress={async () => {
          ;(await goodWallet.isCitizen()) ? this.handleClaim() : this.faceRecognition()
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
        <Section>
          <Section.Row style={styles.centered}>
            <Section.Text>
              <b>367K</b> PEOPLE CLAIMED <b>2.5M G$</b> TODAY!
            </Section.Text>
          </Section.Row>
        </Section>
        <Section>
          <Section.Title>
            YOU NOW HAVE <b>3</b> DAYS OF INCOME WAITING
          </Section.Title>
          <Section.Separator />
          <Section.Text>NEXT DAILY INCOME:</Section.Text>
          <Section.Row style={styles.centered}>
            <BigNumber number={'23:59:59'} />
          </Section.Row>
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
