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
let needToBindEventsWeb3 = true
let needToBindEventsGun = true
export const useConnectionWeb3 = () => {
  const [isConnection, setIsConnection] = useState(true)
  const store = SimpleStore.useStore()
  const wallet = store.get('wallet')
  const isWeb3Connection = async () => {
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
        //if not connected and not reconnecting than try to force reconnect
        if (wallet.wallet.currentProvider.reconnecting === false) {
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
  }

  const bindEvents = method => {
    log.debug('web3 binding listeners')
    const callMethod = method === 'remove' ? 'off' : 'on'
    wallet.wallet.currentProvider[callMethod]('close', () => {
      log.debug('web3 close')
      isWeb3Connection()
    })
    wallet.wallet.currentProvider[callMethod]('error', () => {
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
      const connection = instanceGun.opt.peers[Config.gunPublicUrl]
      log.debug('gun connection:', connection)
      if (connection && connection.wire && connection.wire.readyState === connection.wire.OPEN) {
        if (needToBindEventsGun) {
          bindEvents('add')
        }
        setIsConnection(true)
        needToBindEventsGun = false
      } else {
        setIsConnection(false)
        if (!needToBindEventsGun) {
          bindEvents('remove')
          needToBindEventsGun = true
        }

        setTimeout(isGunConnection, 1000)
      }
    }
  }

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
      wire[callMethod]('close', () => {
        log.debug('gun close')
        isGunConnection()
      })
      wire[callMethod]('error', () => {
        log.debug('gun error')
        isGunConnection()
      })
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
