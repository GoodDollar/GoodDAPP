import { BackHandler } from 'react-native'
import { noop } from 'lodash'

class BackButtonHandler {
  constructor(options = {}) {
    const { defaultAction = noop } = options

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

  handler = action => {
    this.defaultAction()

    return true
  }
}

export default BackButtonHandler
