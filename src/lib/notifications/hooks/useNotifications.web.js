import { noop } from 'lodash'

export const useNotifications = noop

export const useClaimNotificationOptions = () => ({
  enabled: false,
  toggleEnabled: noop,
  updateClaimNotification: noop,
})
