import { useCallback, useEffect, useState } from 'react'
import { AppState, Platform } from 'react-native'
import Config from '../../config/config'
import API from '../API/api'
import { delay } from '../utils/async'
import logger from '../logger/pino-logger'
import SimpleStore from '../undux/SimpleStore'
const log = logger.child({ from: 'hasConnectionChange' })

const useWebConnection = () => {
  const [isConnection, setIsConnection] = useState(true)

  const updateOnlineStatus = () => {
    setIsConnection(navigator.onLine)
  }

  useEffect(() => {
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  return isConnection
}

const useNativeConnection = () => {
  const NetInfo = require('@react-native-community/netinfo')

  const [isConnection, setIsConnection] = useState(true)

  NetInfo.fetch().then(({ isConnected }) => {
    setIsConnection(isConnected)
  })

  useEffect(() => {
    return NetInfo.addEventListener(({ isConnected }) => {
      setIsConnection(isConnected)
    })
  }, [NetInfo])

  return isConnection
}

export const useConnection = Platform.OS === 'web' ? useWebConnection : useNativeConnection

let isFirstCheckWeb3 = false
let isFirstCheckGun = false
let needToBindEventsWeb3 = true
let needToBindEventsGun = true
export const useConnectionWeb3 = () => {
  const [isConnection, setIsConnection] = useState(true)

  const store = SimpleStore.useStore()
  const wallet = store.get('wallet')
  const isWeb3Connection = useCallback(async () => {
    if (wallet) {
      log.debug('isWeb3Connection', isConnection)
      if (!isFirstCheckWeb3) {
        isFirstCheckWeb3 = true
      }

      //verify a blockchain method works ok (balanceOf)
      if (
        wallet.wallet.currentProvider.connected &&
        (await wallet
          .balanceOf()
          .then(_ => true)
          .catch(_ => false))
      ) {
        if (needToBindEventsWeb3) {
          bindEvents('add')
          needToBindEventsWeb3 = false
        }
        setIsConnection(true)
      } else {
        log.debug('isWeb3Connection not connected')

        //if not connected and not reconnecting than try to force reconnect
        if (wallet.wallet.currentProvider.reconnecting === false) {
          log.debug('isWeb3Connection forcing reconnect')
          wallet.wallet.currentProvider.reconnect()
        }
        setIsConnection(false)
        if (!needToBindEventsWeb3) {
          needToBindEventsWeb3 = true
          bindEvents('remove')
        }
        setTimeout(isWeb3Connection, 1000)
      }
    }
  })

  const web3Close = useCallback(() => {
    log.debug('web3 close')
    isWeb3Connection()
  }, [])

  const web3Error = useCallback(() => {
    log.debug('web3 error')
    isWeb3Connection()
  }, [])

  const bindEvents = method => {
    log.debug('web3 binding listeners')
    const callMethod = method === 'remove' ? 'off' : 'on'
    wallet.wallet.currentProvider[callMethod]('close', web3Close)
    wallet.wallet.currentProvider[callMethod]('error', web3Error)
  }

  useEffect(() => {
    if (wallet) {
      AppState.addEventListener('change', nextAppState => {
        if (nextAppState === 'active') {
          log.debug('web3 appstate')
          isWeb3Connection()
        }
      })
      if (!isFirstCheckWeb3) {
        log.debug('web3 first')
        isWeb3Connection()
      }
    }
  }, [isWeb3Connection, wallet])

  return isConnection
}

export const useConnectionGun = () => {
  const [isConnection, setIsConnection] = useState(true)
  const store = SimpleStore.useStore()
  const userStorage = store.get('userStorage')
  const isGunConnection = useCallback(() => {
    if (userStorage) {
      if (!isFirstCheckGun) {
        isFirstCheckGun = true
      }

      const instanceGun = userStorage.gun._
      const connection = instanceGun.opt.peers[Config.gunPublicUrl]
      log.debug('gun connection:', connection)
      if (connection && connection.wire && connection.wire.readyState === connection.wire.OPEN) {
        setIsConnection(true)
        if (needToBindEventsGun) {
          needToBindEventsGun = false
          bindEvents('add')
        }
      } else {
        setIsConnection(false)
        if (!needToBindEventsGun) {
          bindEvents('remove')
          needToBindEventsGun = true
        }
        setTimeout(isGunConnection, 1000)
      }
    }
  })

  const gunClose = useCallback(() => {
    log.debug('gun close')
    isGunConnection()
  }, [])

  const gunError = useCallback(() => {
    log.debug('gun error')
    isGunConnection()
  }, [])

  const bindEvents = method => {
    log.debug('gun binding listeners')
    const instanceGun = userStorage.gun._
    if (
      instanceGun.opt.peers &&
      instanceGun.opt.peers[Config.gunPublicUrl] &&
      instanceGun.opt.peers[Config.gunPublicUrl].wire
    ) {
      const wire = instanceGun.opt.peers[Config.gunPublicUrl].wire
      const callMethod = method === 'remove' ? 'removeEventListener' : 'addEventListener'
      log.debug('add gun binding listeners')

      //guns reconnect automatically so no action required on our side
      wire[callMethod]('close', gunClose)
      wire[callMethod]('error', gunError)
    }
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
  }, [isGunConnection, userStorage])

  return isConnection
}

export const useAPIConnection = () => {
  const [isConnection, setIsConnection] = useState(true)

  /**
   * Don't start app if server isn't responding
   */
  const apiReady = useCallback(async () => {
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
  })

  useEffect(() => {
    apiReady()
  }, [apiReady])

  return isConnection
}
