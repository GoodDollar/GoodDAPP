import logger from '../../lib/logger/pino-logger'
import goodWallet from '../../lib/wallet/GoodWallet'
import userStorage from '../../lib/gundb/UserStorage'
import Config from '../../config/config'

const log = logger.child({ from: 'checkConnection' })

export const checkWalletReady = async () => {
  const isReady = await Promise.all([goodWallet.ready, userStorage.ready])
    .then(_ => true)
    .catch(_ => false)

  log.info('isReady', isReady)

  return isReady
}

export const checkWalletConnection = () => {
  const isWalletConnected = goodWallet.wallet.currentProvider.connected
  log.info('isWalletConnected', isWalletConnected)
  if (!isWalletConnected) {
    if (!goodWallet.wallet.currentProvider.reconnecting) {
      goodWallet.wallet.currentProvider.reconnect()
    }
  }
  return isWalletConnected
}

export const checkWalletAvailable = async () => {
  const isWalletAvailable = await goodWallet
    .balanceOf()
    .then(_ => true)
    .catch(_ => false)

  log.info('isWalletAvailable', isWalletAvailable)

  return isWalletAvailable
}

export const checkGunConnection = () => {
  const instanceGun = userStorage.gun._
  const connection = instanceGun.opt.peers[Config.gunPublicUrl]

  log.info('gunConnection', connection)

  const isGunConnected = connection && connection.wire && connection.wire.readyState === connection.wire.OPEN

  return isGunConnected
}
