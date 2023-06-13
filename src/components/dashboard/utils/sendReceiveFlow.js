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
  const isSendToAddress = routeName === ACTION_SEND_TO_ADDRESS
  const isSend = isSendToAddress || [ACTION_SEND, ACTION_SEND_TO_ADDRESS].includes(action)
  const isAmount = routeName === 'Amount'

  let options = {
    title: isReceive ? RECEIVE_TITLE : isBridge ? BRIDGE_TITLE : SEND_TITLE,
    isBridge,
  }

  if (Config.isDeltaApp && !isBridge && (isAmount || (isSend ? isSendToAddress : !action))) {
    options = {
      ...options,
      title: isReceive ? RECEIVE_NATIVE_TITLE : SEND_NATIVE_TITLE,
      navigationBar: props => <NavBar {...props} />,
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
