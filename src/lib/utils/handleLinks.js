import bip39 from 'bip39-light'
import { DESTINATION_PATH, INVITE_CODE } from '../constants/localStorage'
import DeepLinking from '../../lib/utils/deepLinking'
import { fireEvent, SIGNIN_FAILED, SIGNIN_SUCCESS } from '../../lib/analytics/analytics'
import AsyncStorage from './asyncStorage'
import restart from './restart'
import retryImport from './retryImport'

/**
 * handle in-app links for unsigned users such as magiclink and paymentlinks
 * magiclink proceed to signin other links we keep and pop once user is logged in
 *
 * @returns {Promise<boolean>}
 */
const handleLinks = async log => {
  const params = DeepLinking.params

  try {
    const { magiclink, inviteCode } = params

    //if invite code exists, persist in asyncstorage
    if (inviteCode) {
      AsyncStorage.setItem(INVITE_CODE, inviteCode)
    }

    if (magiclink) {
      let userNameAndPWD = Buffer.from(decodeURIComponent(magiclink), 'base64').toString()
      let userNameAndPWDArray = userNameAndPWD.split('+')
      log.debug('recoverByMagicLink', { magiclink, userNameAndPWDArray })
      if (userNameAndPWDArray.length === 2) {
        const userName = userNameAndPWDArray[0]
        const userPwd = userNameAndPWDArray[1]
        const UserStorage = await retryImport(() => import('../../lib/gundb/UserStorageClass')).then(_ => _.UserStorage)

        const mnemonic = await UserStorage.getMnemonic(userName, userPwd)

        if (mnemonic && bip39.validateMnemonic(mnemonic)) {
          const mnemonicsHelpers = retryImport(() => import('../../lib/wallet/SoftwareWalletProvider'))
          const { saveMnemonics } = await mnemonicsHelpers
          await saveMnemonics(mnemonic)
          await AsyncStorage.setItem('GD_isLoggedIn', true)
          fireEvent(SIGNIN_SUCCESS)
          restart('/')
        }
      }
    } else {
      let path = DeepLinking.pathname.slice(1)
      path = path.length === 0 ? 'AppNavigation/Dashboard/Home' : path

      if (params && Object.keys(params).length > 0) {
        const dest = { path, params }
        log.debug('Saving destination url', dest)
        await AsyncStorage.setItem(DESTINATION_PATH, dest)
      }
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
