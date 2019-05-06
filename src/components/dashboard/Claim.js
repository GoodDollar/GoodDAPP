// @flow
import React, { Component } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import type { Store } from 'undux'
import GDStore from '../../lib/undux/GDStore'
import { PushButton } from '../appNavigation/stackNavigation'
import { BigNumber, BigGoodDollar, Section, TopBar, Wrapper } from '../common'
import { weiToMask } from '../../lib/wallet/utils'
import type { DashboardProps } from './Dashboard'

type ClaimProps = DashboardProps & {
  store: Store
}

class Claim extends Component<ClaimProps, {}> {
  render() {
    const { screenProps, store }: ClaimProps = this.props
    const { entitlement } = store.get('account')
    return (
      <Wrapper>
        <TopBar push={screenProps.push} />
        <Section>
          <Section.Title>GoodDollar is a good economy, each day you can collect your part in the economy</Section.Title>
          <Section.Row style={styles.centered}>
            <Section.Text>{`TODAY'S DAILY INCOME `}</Section.Text>
            <BigGoodDollar number={entitlement} />
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
            disabled={entitlement <= 0}
            routeName={'FaceRecognition'}
            screenProps={screenProps}
            style={[styles.buttonLayout, styles.signUpButton]}
          >
            {`CLAIM YOUR SHARE - ${weiToMask(entitlement, { showUnits: true })}`}
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

const claim = GDStore.withStore(Claim)
claim.navigationOptions = { title: 'Claim GD' }

export default claim
