import retryImport from '../../lib/utils/retryImport'
import logger from '../../lib/logger/pino-logger'

const log = logger.child({ from: 'Ready' })

const ready = async replacing => {
  const loginPromise = retryImport(() => import('../../lib/login/GoodWalletLogin'))
  log.debug('ready: Starting initialization', { replacing })

  const { init } = await retryImport(() => import('../../init'))
  log.debug('ready: got init', init)

  const { goodWallet, userStorage, source } = await init()
  log.debug('ready: done init')

  if (replacing) {
    log.debug('reinitializing wallet and storage with new user')

    goodWallet.init()
    await goodWallet.ready
    userStorage.init()
  }

  await userStorage.ready
  log.debug('ready: userstorage ready')

  // the login also re-initialize the api with new jwt
  const { default: login } = await loginPromise
  log.debug('ready: got login', login)

  try {
    await login.auth()
  } catch (exception) {
    const { message } = exception

    log.error('failed auth:', message, exception)
  } finally {
    log.debug('ready: login ready')
  }

  return { goodWallet, userStorage, source }
}

export default ready
