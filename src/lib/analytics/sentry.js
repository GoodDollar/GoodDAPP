import * as Sentry from '@sentry/browser'
import _forEach from 'lodash/forEach'
import Config from '../../config/config'

export const initSentry = async (goodWallet, userStorage) => {
  const identifier = goodWallet && goodWallet.getAccountForType('login')
  const email = userStorage && (await userStorage.getProfileFieldValue('email'))

  Sentry.init({
    dsn: Config.sentryDSN,
  })

  Sentry.configureScope(scope => {
    if (email || identifier) {
      scope.setUser({
        id: identifier,
        email: email,
      })
    }

    scope.setTag('appVersion', Config.version)
  })
}

export const reportToSentry = (error, extra = {}, tags = {}) =>
  Sentry.configureScope(scope => {
    // set extra
    _forEach(extra, (value, key) => {
      scope.setExtra(key, value)
    })

    // set tags
    _forEach(tags, (value, key) => {
      scope.setTags(key, value)
    })

    Sentry.captureException(error)
  })
