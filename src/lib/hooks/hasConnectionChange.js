import { useEffect, useState } from 'react'
import { AppState, NetInfo } from 'react-native'
import Config from '../../config/config'
import API from '../API/api'
import { delay } from '../utils/async'
import logger from '../logger/pino-logger'

const log = logger.child({ from: 'hasConnectionChange' })

export const useConnection = () => {
  const [isConnection, setIsConnection] = useState(true)

  NetInfo.isConnected.fetch().then(isConnectionNow => setIsConnection(isConnectionNow))

  useEffect(() => {
    NetInfo.isConnected.addEventListener('connectionChange', connection => {
      setIsConnection(connection)
    })
  }, [])

  return isConnection
}

export const useConnectionWeb3 = () => {
  const [isConnection, setIsConnection] = useState(true)

  const isWeb3Connection = () => {
    if (global.wallet.wallet.currentProvider.connected) {
      setIsConnection(true)
    } else {
      setIsConnection(false)
      global.wallet.wallet.currentProvider.reconnect()
      setTimeout(isWeb3Connection, 500)
    }
  }

  useEffect(() => {
    AppState.addEventListener('change', () => {
      if (global.wallet) {
        isWeb3Connection()
      }
    })
  }, [])

  return isConnection
}

export const useConnectionGun = () => {
  const [isConnection, setIsConnection] = useState(true)

  const isGun3Connection = () => {
    const instanceGun = global.userStorage.gun._
    const wire = instanceGun.opt.peers[Config.gunPublicUrl].wire
    if (wire.readyState === wire.OPEN) {
      setIsConnection(true)
    } else {
      setIsConnection(false)
      setTimeout(isGun3Connection, 500)
    }
  }

  useEffect(() => {
    AppState.addEventListener('change', () => {
      if (global.userStorage) {
        isGun3Connection()
      }
    })
  }, [])

  return isConnection
}

export const useAPIConnection = () => {
  const [isConnection, setIsConnection] = useState(true)

  /**
   * Don't start app if server isn't responding
   */
  const apiReady = async () => {
    try {
      await API.ready
      const res = await Promise.race([
        API.ping()
          .then(_ => true)
          .catch(_ => 'ping error'),
        delay(3000).then(_ => 'timeout'),
      ])
      log.debug('apiReady:', { res })
      if (res !== true) {
        setIsConnection(false)
        await delay(3000)
        return apiReady()
      }
      setIsConnection(true)
      return
    } catch (e) {
      log.debug('apiReady:', e.message)
      setIsConnection(false)
      await delay(3000)

      // return apiReady()
    }
  }

  useEffect(() => {
    apiReady()
  }, [])

  return isConnection
}
