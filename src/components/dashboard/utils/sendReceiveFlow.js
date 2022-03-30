import { t } from '@lingui/macro'

export const navigationOptions = ({ navigation }) => {
  const action = navigation.getParam(PARAM_ACTION)
  return {
    title: action === ACTION_RECEIVE ? RECEIVE_TITLE : SEND_TITLE,
  }
}

export const RECEIVE_TITLE = t`Receive G$`
export const SEND_TITLE = t`Send G$`
export const ACTION_RECEIVE = 'Receive'
export const ACTION_SEND = 'Send'
export const ACTION_SEND_TO_ADDRESS = 'SendToAddress'
export const PARAM_ACTION = 'action'
