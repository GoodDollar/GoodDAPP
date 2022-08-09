import { noop } from 'lodash'

export const CLAIM_NOTIFICATION = 'claim-notification'

export const dailyClaimTime = new Date().setUTCHours(12)

export const notificationsCategories = {
  CLAIM: 'CLAIM',
}

export const dailyClaimNotification = noop

export const useNotifications = noop
