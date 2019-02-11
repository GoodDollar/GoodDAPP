// @flow
import React, { Component } from 'react'
import goodWallet from '../../lib/wallet/GoodWallet'
import { StyleSheet, View, Image } from 'react-native'
import { normalize } from 'react-native-elements'
import { PushButton } from '../appNavigation/stackNavigation'
import type { DashboardProps, DashboardState } from './Dashboard'
import logger from '../../lib/logger/pino-logger'
import { Wrapper, Section, BigNumber, Avatar } from '../common'

const log = logger.child({ from: 'Claim' })

type ClaimState = DashboardState & {
  canClaim: boolean
}

type ClaimProps = DashboardProps
class Claim extends Component<ClaimProps, ClaimState> {
  static navigationOptions = { title: 'Claim GD' }

  state = {
    canClaim: false,
    entitlement: '0',
    balance: undefined
  }

  eventHandlers: any

  async componentDidMount(): Promise<void> {
    try {
      const entitlement = await goodWallet.checkEntitlement()
      const balance = await goodWallet.balanceOf()
      this.setState({ canClaim: !!+entitlement, entitlement, balance })
    } catch (e) {
      console.log(e)
    }
  }

  render() {
    const { screenProps, navigation }: ClaimProps = this.props
    const { canClaim, entitlement } = this.state

    return (
      <Wrapper>
        <Section>
          <Section.Row>
            <Avatar />
            <BigNumber number={this.state.balance} unit={'GD'} />
          </Section.Row>
        </Section>
        <Section>
          <Section.Title>GoodDollar is a good economy, each day you can collect your part in the economy</Section.Title>
          <Section.Row style={styles.centered}>
            <Section.Text>{`TODAY'S DAILY INCOME `}</Section.Text>
            <BigNumber number={entitlement} unit={'GD'} />
          </Section.Row>
          <Image style={styles.graph} source={require('./graph.png')} />
        </Section>
        <Section>
          <Section.Row style={styles.centered}>
            <Section.Text>
              <b>367K</b> PEOPLE CLAIMED <b>2.5M GD</b> TODAY!
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
        <View>
          <PushButton
            disabled={!canClaim}
            routeName={'FaceRecognition'}
            screenProps={screenProps}
            style={[styles.buttonLayout, styles.signUpButton]}
          >
            {`CLAIM YOUR SHARE - ${entitlement} GD`}
          </PushButton>
        </View>
      </Wrapper>
    )
  }
}

const styles = StyleSheet.create({
  buttonLayout: {
    marginTop: 30,
    padding: 10
  },
  buttonText: {
    fontFamily: 'Helvetica, "sans-serif"',
    fontSize: normalize(16),
    color: 'white',
    fontWeight: 'bold'
  },
  signUpButton: {
    backgroundColor: '#555555'
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'baseline'
  },
  graph: {
    width: '323px',
    maxWidth: '100%',
    height: '132px',
    alignSelf: 'center'
  }
})

export default Claim
