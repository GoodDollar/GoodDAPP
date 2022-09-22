// eslint-disable-next-line import/default
import PushNotification from 'react-native-push-notification'
import { promisify } from 'es6-promisify'

import { nodeize } from '../../utils/async'
import { NotificationsAPIClass } from './NotificationsApi.common'

export { MessagingAPI } from './NotificationsApi.common'

const fetchInitialNotification = (api => {
  const { popInitialNotification } = api

  return promisify(nodeize(popInitialNotification.bind(api)))
})(PushNotification)

export const NotificationsAPI = new class extends NotificationsAPIClass {
  async getInitialNotification() {
    let notification = await super.getInitialNotification()

    if (!notification) {
      const { data } = await fetchInitialNotification()

      notification = this._makeFromPayload(data)
    }

    return notification
  }
}(PushNotification)
