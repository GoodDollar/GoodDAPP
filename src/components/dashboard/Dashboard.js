// @flow
import React, { Component } from 'react'
import { StyleSheet, Text, View, Button } from 'react-native'
import { normalize } from 'react-native-elements'
import type { Store } from 'undux'

import GDStore from '../../lib/undux/GDStore'
import { weiToMask } from '../../lib/wallet/utils'
import { createStackNavigator, PushButton } from '../appNavigation/stackNavigation'
import TabsView from '../appNavigation/TabsView'
import { Avatar, BigGoodDollar, Section, Wrapper } from '../common'
import Amount from './Amount'
import ModalSlider from './ModalSlider.web'
import ListSlider from './ListSlider'
import Claim from './Claim'
import FaceRecognition from './FaceRecognition'
import Reason from './Reason'
import Receive from './Receive'
import ReceiveAmount from './ReceiveAmount'
import ScanQR from './ScanQR'
import Send from './Send'
import SendConfirmation from './SendConfirmation'
import SendLinkSummary from './SendLinkSummary'
import SendQRSummary from './SendQRSummary'

import Withdraw from './Withdraw'

export type DashboardProps = {
  screenProps: any,
  navigation: any,
  store: Store
}

type DashboardState = {
  param: string,
  modalSendVisible: boolean,
  horizontal: boolean
}

class Dashboard extends Component<DashboardProps, DashboardState> {
  state = {
    param: '',
    modalSendVisible: false,
    horizontal: false
  }

  componentDidMount() {
    const param = this.props.navigation.getParam('receiveLink', 'no-param')

    if (param !== 'no-param') {
      console.log({ param })
      this.setState({ param })
    }
  }

  toggleModal = () => {
    this.setState({ modalSendVisible: !this.state.modalSendVisible })
  }

  render() {
    const { param, modalSendVisible, horizontal } = this.state
    const { screenProps, navigation, store }: DashboardProps = this.props
    const { balance, entitlement } = store.get('account')
    const { fullName } = store.get('profile')

    const sliderData = [
      {
        title: 'Received GD',
        key: '1',
        gd: '+124GD',
        person: 'David James',
        for: 'For the pizza',
        message: 'Thanks man, I truly appreciate it! See you soon :)',
        date: '31/12/18 22:45',
        type: 'receive',
        actions: [
          {
            title: 'OK',
            color: '#ccc',
            onPress: () => console.log('called')
          }
        ]
      },
      {
        title: 'Sent GD',
        key: '2',
        gd: '-85GD',
        person: 'Michelle Pauli',
        for: 'For the Books',
        message: "You've got an awesome collection",
        date: '31/12/18 22:45',
        type: 'send',
        actions: [
          {
            title: 'OK',
            color: '#ccc',
            onPress: () => console.log('called')
          }
        ]
      },
      {
        title: 'Doing Good',
        key: '3',
        person: 'Maisao Matimbo',
        message: '"I can buy food for my children!" Nairobi, Kenya - 24,600 people are using GD...',
        date: '31/12/18 22:45',
        type: 'message',
        actions: [
          {
            title: 'Share',
            color: '#fff',
            onPress: () => console.log('called')
          }
        ],
        image: ''
      },
      {
        title: 'Invite friends to GoodDollar',
        key: '4',
        message:
          'Send invites to get more people connected on GoodDollar. You will earn GD and also Help other people to earn.',
        date: '31/12/18 22:45',
        type: 'notification',
        actions: [
          {
            title: 'LATER',
            color: '#fff',
            onPress: () => console.log('called')
          },
          {
            title: 'INVITE',
            color: '#ccc',
            onPress: () => console.log('called')
          }
        ],
        image: ''
      },
      {
        title: 'This person needs your verification, do you know him?',
        key: '5',
        person: {
          name: 'John Doe',
          phone: '+972-**-***3336',
          email: 'j****e@gmail.com',
          location: 'New Delhi, India',
          birth: '12/30/1980',
          facebook: '',
          twitter: '',
          linkedin: '',
          instagram: ''
        },
        date: '31/12/18 22:45',
        type: 'confirmation',
        actions: [
          {
            title: "No, I don't know him",
            color: '#fff',
            onPress: () => console.log('called')
          },
          {
            title: 'VOUCHER FOR HIM',
            color: '#ccc',
            onPress: () => console.log('called')
          }
        ]
      },
      {
        title: 'How likely are you to recommend GoodDollar to a friend or colleague?',
        key: '6',
        type: 'feedback',
        actions: [
          {
            title: 'NOT NOW',
            color: '#fff',
            onPress: () => console.log('called')
          }
        ]
      }
    ]

    return (
      <View>
        <TabsView goTo={navigation.navigate} routes={screenProps.routes} />
        <Wrapper>
          <Section>
            <Section.Row style={styles.centered}>
              <Avatar size={80} onPress={() => screenProps.push('Profile')} />
            </Section.Row>
            <Section.Row style={styles.centered}>
              <Section.Title>{fullName || 'John Doe'}</Section.Title>
            </Section.Row>
            <Section.Row style={styles.centered}>
              <BigGoodDollar number={balance} />
            </Section.Row>
            <Section.Row style={styles.buttonRow}>
              <PushButton routeName={'Send'} screenProps={screenProps} style={styles.leftButton}>
                Send
              </PushButton>
              <PushButton routeName={'Claim'} screenProps={screenProps}>
                <Text style={[styles.buttonText]}>Claim</Text>
                <br />
                <Text style={[styles.buttonText, styles.grayedOutText]}>
                  {weiToMask(entitlement, { showUnits: true })}
                </Text>
              </PushButton>
              <PushButton routeName={'Receive'} screenProps={screenProps} style={styles.rightButton}>
                Receive
              </PushButton>
            </Section.Row>
          </Section>
          <Button onPress={this.toggleModal} title="Show Modal" />
          <ModalSlider
            visible={modalSendVisible}
            title="Sent GD by Link"
            toggleModal={this.toggleModal}
            addressee="Johannah Marshall"
          />
          <ListSlider
            title="Test"
            horizontal={horizontal}
            fixedHeight
            virtualized
            data={sliderData}
            getData={() => sliderData}
            updateData={() => {}}
            onEndReached={() => {}}
          />
        </Wrapper>
        {param ? <Withdraw param={param} {...this.props} /> : null}
      </View>
    )
  }
}

// onEndReached = () => {
//   if (this.props.data.length >= 1000) return
//   this.setState(state => ({
//     data: state.data.concat(this.props.getData(100, this.props.data.length))
//   }))
// }
const styles = StyleSheet.create({
  buttonText: {
    fontFamily: 'Helvetica, "sans-serif"',
    fontSize: normalize(16),
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  buttonRow: {
    alignItems: 'stretch',
    marginTop: normalize(10)
  },
  grayedOutText: {
    color: '#d5d5d5',
    fontSize: normalize(10)
  },
  leftButton: {
    flex: 1,
    marginRight: normalize(10)
  },
  rightButton: {
    flex: 1,
    marginLeft: normalize(10)
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'baseline'
  }
})

const dashboard = GDStore.withStore(Dashboard)

dashboard.navigationOptions = {
  navigationBarHidden: true
}

export default createStackNavigator({
  Home: dashboard,
  Claim,
  Receive,
  Amount,
  Reason,
  ReceiveAmount,
  Send,
  SendLinkSummary,
  SendConfirmation,
  FaceRecognition,
  ScanQR,
  SendQRSummary
})
