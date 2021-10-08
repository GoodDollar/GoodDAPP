import { BackHandler } from 'react-native'
import { noop } from 'lodash'

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
    this.defaultAction()

    return true
  }
}

export default BackButtonHandler
