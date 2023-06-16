import React, { useContext } from 'react'
import { t } from '@lingui/macro'
import Config from '../../../config/config'
import AppNavBar from '../../appNavigation/NavBar'
import { TokenContext } from '../../../lib/wallet/GoodWalletProvider'
import { NetworkName } from '../../appNavigation/TabsView'

const NavBar = ({ title, goBack }) => {
  const { token } = useContext(TokenContext)

  return (
    <AppNavBar goBack={goBack} title={`${title} ${token}`}>
      <NetworkName icon={false} />
    </AppNavBar>
  )
}

export const navigationOptions = ({ navigation, screenProps }) => {
  const { routeName } = navigation.state
  const action = navigation.getParam(PARAM_ACTION)

  const isBridge = navigation.getParam('isBridge')
  const isReceive = action === ACTION_RECEIVE || ['Receive', 'ReceiveToAddress'].includes(routeName)

  let options = {
    title: isReceive ? RECEIVE_TITLE : isBridge ? BRIDGE_TITLE : SEND_TITLE,
    isBridge,
  }

  if (Config.isDeltaApp && !isBridge) {
    options.title = isReceive ? RECEIVE_NATIVE_TITLE : SEND_NATIVE_TITLE

    if (['Amount', 'Receive'].includes(routeName)) {
      options.navigationBar = props => <NavBar {...props} />
    }
  }

  return options
}

export const RECEIVE_TITLE = t`Receive G$`
export const RECEIVE_NATIVE_TITLE = t`Receive`
export const SEND_TITLE = t`Send G$`
export const SEND_NATIVE_TITLE = t`Send`
export const BRIDGE_TITLE = t`Bridge G$`
export const ACTION_RECEIVE = 'Receive'
export const ACTION_SEND = 'Send'
export const ACTION_SEND_TO_ADDRESS = 'SendToAddress'
export const PARAM_ACTION = 'action'
