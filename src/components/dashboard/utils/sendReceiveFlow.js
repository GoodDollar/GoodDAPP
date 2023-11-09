import React, { useContext } from 'react'
import { t } from '@lingui/macro'
import AppNavBar from '../../appNavigation/NavBar'
import { TokenContext } from '../../../lib/wallet/GoodWalletProvider'
import { NetworkName } from '../../appNavigation/TabsView'

const NavBar = ({ title, goBack, isBridge }) => {
  const { token } = useContext(TokenContext)

  return (
    <AppNavBar goBack={goBack} title={isBridge ? title : `${title} ${token}`}>
      <NetworkName icon={false} />
    </AppNavBar>
  )
}

export const navigationOptions = ({ navigation }) => {
  const { routeName } = navigation.state
  const action = navigation.getParam(PARAM_ACTION)

  const isBridge = navigation.getParam('isBridge')
  const isReceive = action === ACTION_RECEIVE || ['Receive', 'ReceiveToAddress'].includes(routeName)

  return {
    title: isReceive ? RECEIVE_TITLE : isBridge ? BRIDGE_TITLE : SEND_TITLE,
    navigationBar: NavBar,
    isBridge,
  }
}

export const RECEIVE_TITLE = t`Receive`
export const SEND_TITLE = t`Send`
export const BRIDGE_TITLE = t`Bridge`
export const ACTION_RECEIVE = 'Receive'
export const ACTION_SEND = 'Send'
export const ACTION_SEND_TO_ADDRESS = 'SendToAddress'
export const PARAM_ACTION = 'action'
