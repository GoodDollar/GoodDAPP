// @flow
import { Linking, Platform } from 'react-native'

import { DESTINATION_PATH, INVITE_CODE } from '../constants/localStorage'
import { fireEvent, SIGNIN_FAILED } from '../../lib/analytics/analytics'

import DeepLinking from '../../lib/utils/deepLinking'

import logger from '../../lib/logger/js-logger'
import AsyncStorage from './asyncStorage'

const log = logger.child({ from: 'Linking' })
const schemeRe = /(.+?:)\/\//

export const openLink = async (uri: string, target: '_blank' | '_self' = '_blank', noopener: boolean = false) => {
  const isSchemeSupported = await Linking.canOpenURL(uri)

  if (!isSchemeSupported) {
    const [, scheme] = schemeRe.exec(uri)

    throw new Error(`There aren't apps installed can handle '${scheme}' scheme`)
  }

  if (Platform.OS === 'web') {
    const args = [new URL(uri, window.location).toString(), target]

    if (noopener) {
      args.push('noopener')
    }

    window.open(...args)
    return
  }

  return Linking.openURL(uri)
}

export const handleLinks = async (logger = log) => {
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

      logger.debug('Saving destination url', dest)
      await AsyncStorage.setItem(DESTINATION_PATH, dest)
    }
  } catch (e) {
    if (params.magiclink) {
      logger.error('Magiclink signin failed', e.message, e)
      fireEvent(SIGNIN_FAILED)
      return
    }

    logger.error('parsing in-app link failed', e.message, e, params)
  }
}
