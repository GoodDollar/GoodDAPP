import { DESTINATION_PATH, INVITE_CODE } from '../constants/localStorage'
import DeepLinking from '../../lib/utils/deepLinking'
import { fireEvent, SIGNIN_FAILED } from '../../lib/analytics/analytics'
import AsyncStorage from './asyncStorage'

/**
 * handle in-app links for unsigned users such as magiclink and paymentlinks
 * magiclink proceed to signin other links we keep and pop once user is logged in
 *
 * @returns {Promise<boolean>}
 */
const handleLinks = async log => {
  const params = DeepLinking.params

  try {
    const { inviteCode } = params

    //if invite code exists, persist in asyncstorage
    if (inviteCode) {
      AsyncStorage.setItem(INVITE_CODE, inviteCode)
    }

    let path = DeepLinking.pathname.slice(1)
    path = path.length === 0 ? 'AppNavigation/Dashboard/Home' : path

    if (params && Object.keys(params).length > 0) {
      const dest = { path, params }
      log.debug('Saving destination url', dest)
      await AsyncStorage.setItem(DESTINATION_PATH, dest)
    }
  } catch (e) {
    if (params.magiclink) {
      log.error('Magiclink signin failed', e.message, e)
      fireEvent(SIGNIN_FAILED)
    } else {
      log.error('parsing in-app link failed', e.message, e, params)
    }
  }
}

export default handleLinks
