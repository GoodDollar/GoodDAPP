export const navigationOptions = ({ navigation }) => {
  const action = navigation.getParam(PARAM_ACTION)
  return {
    title: action === ACTION_RECEIVE ? RECEIVE_TITLE : SEND_TITLE,
  }
}

export const RECEIVE_TITLE = 'Receive G$'
export const SEND_TITLE = 'Send G$'
export const ACTION_RECEIVE = 'Receive'
export const ACTION_SEND = 'Send'
export const PARAM_ACTION = 'action'
