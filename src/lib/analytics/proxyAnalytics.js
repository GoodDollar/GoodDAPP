//@flow

import { fireEvent } from './analytics'
export const CLICK_BTN_SIGNIN = 'CLICK_BTN_SIGNIN'
export const CLICK_BTN_RECOVER_WALLET = 'CLICK_BTN_RECOVER_WALLET'
export const CLICK_BTN_CARD_ACTION = 'CLICK_BTN_CARD_ACTION'
export const CLICK_DELETE_WALLET = 'CLICK_DELETE_WALLET'
export const SIGNIN_SUCCESS = 'SIGNIN_SUCCESS'
export const RECOVER_SUCCESS = 'RECOVER_SUCCESS'
export const CLAIM_SUCCESS = 'CLAIM_SUCCESS'
export const CARD_OPEN = 'CARD_OPEN'
export const PROFILE_PRIVACY = 'PROFILE_PRIVACY'
export const PROFILE_IMAGE = 'PROFILE_IMAGE'
export const PROFILE_UPDATE = 'PROFILE_UPDATE'
export const PHRASE_BACKUP = 'PHRASE_BACKUP'
export const ADDTOHOME = 'ADDTOHOME'
export const ERROR_LOG = 'ERROR'
export const QR_SCAN = 'QR_SCAN'
export const APP_OPEN = 'APP_OPEN'
export const LOGOUT = 'LOGOUT'
export const CARD_SLIDE = 'CARD_SLIDE'

/**
 * layer of analytics
 * @param {string} eventCode
 * @param {object} params
 */
export const fireEventByCode = (eventCode: string, params?: any = {}) => {
  let event = eventCode

  switch (eventCode) {
    case ERROR_LOG:
      params = { code: params && params[1] ? params[1] : '' }
      break

    default:
      break
  }

  fireEvent(event, params)
}

/**
 * Create code from navigation active route and call `fireEventByCode`
 * @param {object} navigation
 */
export const fireEventFromNavigation = navigation => {
  const route = navigation.state.routes[navigation.state.index]
  const key = route.key
  const action = route.params && route.params.action ? `${route.params.action}` : 'GOTO'
  const code = `${action}_${key}`.toUpperCase()

  fireEventByCode(code)
}
