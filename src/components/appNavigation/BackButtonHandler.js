import { noop } from 'lodash'
import { BackHandler } from 'react-native'
import { exitApp } from '../../lib/utils/system'

class BackButtonHandler {
  subscription = null

  constructor(options = {}) {
    const { defaultAction = noop } = options

    this.defaultAction = defaultAction
    this.register()
  }

  register = () => {
    this.unregister()
    this.subscription = BackHandler.addEventListener('hardwareBackPress', this.handler)
  }

  unregister = () => {
    const { subscription } = this

    if (subscription) {
      subscription.remove()
    }

    this.subscription = null
  }

  handler = action => {
    const now = Date.now()

    if (now - this.lastPress <= 300) {
      this.unregister()
      return exitApp
    }

    this.lastPress = Date.now()
    this.defaultAction()

    return true
  }
}

export default BackButtonHandler
