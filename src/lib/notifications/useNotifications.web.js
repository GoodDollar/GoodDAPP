import { noop } from 'lodash/util'

export const notificationsAvailable = false

export const useNotificationsOptions = () => [false, noop]

export const useNotifications = noop
