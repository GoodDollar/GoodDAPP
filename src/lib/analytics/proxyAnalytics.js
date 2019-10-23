//@flow
import { fireEvent } from './analytics'

export const CLICK_BTN_SIGNIN = 'CLICK_BTN_SIGNIN'
export const CLICK_BTN_RECOVER_WALLET = 'CLICK_BTN_RECOVER_WALLET'
export const CLICK_BTN_CARD_ACTION = 'CLICK_BTN_CARD_ACTION'
export const SIGNIN_SUCCESS = 'SIGNIN_SUCCESS'
export const RECOVER_SUCCESS = 'RECOVER_SUCCESS'
export const CLAIM_SUCCESS = 'CLAIM_SUCCESS'
export const CARD_OPEN = 'CARD_OPEN'
export const PROFILE_PRIVACY = 'PROFILE_PRIVACY'
export const PROFILE_IMAGE = 'PROFILE_IMAGE'
export const PROFILE_UPDATE = 'PROFILE_UPDATE'
export const PHRASE_BACKUP = 'PHRASE_BACKUP'
export const ADDTOHOME = 'ADDTOHOME'

/**
 * layer of analytics
 * @param {string} eventCode
 * @param {object} params
 */
export const fireEventByCode = (eventCode: string, params?: any = {}) => {
  let event = eventCode

  fireEvent(event, params)
}
