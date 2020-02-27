import { BackHandler } from 'react-native'
class BackButtonHandler {
  constructor({ defaultAction }) {
    this.defaultAction = defaultAction
    this.register()
  }

  register = () => {
    this.unregister()
    BackHandler.addEventListener('hardwareBackPress', this.handler)
  }

  unregister = () => {
    BackHandler.removeEventListener('hardwareBackPress', this.handler)
  }

  lastPress = 0

  handler = action => {
    const now = Date.now()

    if (now - this.lastPress <= 300) {
      return BackHandler.exitApp()
    }
    this.lastPress = Date.now()
    this.defaultAction()
    return true
  }
}

export default BackButtonHandler
