// @flow
import { Linking, Platform } from 'react-native'

import { DESTINATION_PATH, INVITE_CODE } from '../constants/localStorage'
import { fireEvent, SIGNIN_FAILED } from '../analytics/analytics'

import logger from '../logger/js-logger'
import API from '../API'
import DeepLinking from './deepLinking'

import AsyncStorage from './asyncStorage'
import { encodeBase64Params } from './uri'
import { exitApp } from './system'

const log = logger.child({ from: 'Linking' })
const schemeRe = /(.+?:)\/\//

export const openLink = async (uri: string, target: '_blank' | '_self' = '_blank', noopener: boolean = false) => {
  if (Platform.OS === 'web') {
    const args = [new URL(uri, window.location).toString(), target]

    if (noopener) {
      args.push('noopener')
    }

    window.open(...args)
    return
  }

  // need to return original promise for compatibility
  let result

  try {
    result = await Linking.openURL(uri)
  } catch (exception) {
    let error = exception

    // check does sheme supported to make sure the exception is about this case
    const isSchemeSupported = await Linking.canOpenURL(uri).catch(() => false)

    if (!isSchemeSupported) {
      const [, scheme] = schemeRe.exec(uri)

      error = new Error(`There aren't apps installed can handle '${scheme}' scheme`)
    }

    log.error('Failed to open link', error.message, error, { uri })
    throw error
  }

  return result
}

export const handleLinks = async (logger = log) => {
  const { params, pathname } = DeepLinking

  try {
    const { inviteCode } = params

    // if invite code exists, persist in asyncstorage
    if (inviteCode) {
      await AsyncStorage.setItem(INVITE_CODE, inviteCode)
    }

    let path = (pathname || '').slice(1)
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

export const redirectTo = async (url, type: 'rdu' | 'cbu', params = {}) => {
  if (type === 'rdu') {
    return openLink(`${url}?login=${encodeBase64Params(params)}`, '_self')
  }

  try {
    await API.invokeCallbackUrl(url, params)
  } catch (e) {
    log.warn('Error sending login vendor details', e.message, e)
  } finally {
    exitApp()
  }
}
