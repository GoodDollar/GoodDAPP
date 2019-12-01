import { useEffect, useState } from 'react'
import { AppState, NetInfo } from 'react-native'
import Config from '../../config/config'
import API from '../API/api'
import { delay } from '../utils/async'
import logger from '../logger/pino-logger'
import SimpleStore from '../undux/SimpleStore'
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

let isFirstCheckWeb3 = false
let isFirstCheckGun = false
export const useConnectionWeb3 = () => {
  const [isConnection, setIsConnection] = useState(true)
  const store = SimpleStore.useStore()
  const wallet = store.get('wallet')
  const isWeb3Connection = () => {
    if (wallet) {
      log.debug('isWeb3Connection', isConnection)
      if (!isFirstCheckWeb3) {
        isFirstCheckWeb3 = true
      }
      if (wallet.wallet.currentProvider.connected) {
        bindEvents()
        setIsConnection(true)
      } else {
        //if not connected and not reconnecting than try to force reconnect
        if (wallet.wallet.currentProvider.reconnecting === false) {
          wallet.wallet.currentProvider.reconnect()
        }
        setIsConnection(false)
        setTimeout(isWeb3Connection, 500)
      }
    }
  }

  const bindEvents = () => {
    log.debug('web3 binding listeners')
    wallet.wallet.currentProvider
      .on('close', () => {
        log.debug('web3 close')
        isWeb3Connection()
      })
      .on('error', () => {
        log.debug('web3 error')
        isWeb3Connection()
      })
  }

  useEffect(() => {
    if (wallet) {
      AppState.addEventListener('change', nextAppState => {
        if (nextAppState === 'active') {
          isWeb3Connection()
        }
      })
      if (!isFirstCheckWeb3) {
        isWeb3Connection()
      }
    }
  }, [wallet])

  return isConnection
}

export const useConnectionGun = () => {
  const [isConnection, setIsConnection] = useState(true)
  const store = SimpleStore.useStore()
  const userStorage = store.get('userStorage')
  const isGunConnection = () => {
    if (userStorage) {
      if (!isFirstCheckGun) {
        isFirstCheckGun = true
      }

      const instanceGun = userStorage.gun._
      const wire = instanceGun.opt.peers[Config.gunPublicUrl].wire
      log.debug('gun wirestate:', wire)
      if (wire.readyState === wire.OPEN) {
        setIsConnection(true)
        bindEvents()
      } else {
        setIsConnection(false)
        setTimeout(isGunConnection, 500)
      }
    }
  }

  const bindEvents = () => {
    log.debug('gun binding listeners')
    const instanceGun = userStorage.gun._
    const wire = instanceGun.opt.peers[Config.gunPublicUrl].wire

    //guns reconnect automatically so no action required on our side
    wire.addEventListener('close', () => {
      log.debug('gun close')
      isGunConnection()
    })
    wire.addEventListener('error', () => {
      log.debug('gun error')
      isGunConnection()
    })
  }

  useEffect(() => {
    if (userStorage) {
      AppState.addEventListener('change', nextAppState => {
        if (nextAppState === 'active') {
          isGunConnection()
        }
      })
      if (!isFirstCheckGun) {
        isGunConnection()
      }
    }
  }, [userStorage])

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
