import { useCallback, useEffect, useRef, useState } from 'react'
import { NetInfo } from 'react-native'
import { get } from 'lodash'
import Config from '../../config/config'
import API from '../API/api'
import { delay } from '../utils/async'
import logger from '../logger/pino-logger'
import SimpleStore from '../undux/SimpleStore'
import useAppState from './useAppState'

const log = logger.child({ from: 'hasConnectionChange' })

export const useConnection = () => {
  const [isConnection, setIsConnection] = useState(true)

  useEffect(() => {
    const cb = connection => {
      setIsConnection(connection)
    }
    NetInfo.isConnected.fetch().then(isConnectionNow => setIsConnection(isConnectionNow))
    NetInfo.isConnected.addEventListener('connectionChange', cb)
    return () => NetInfo.isConnected.removeEventListener('connectionChange', cb)
  }, [])

  return isConnection
}

export const useConnectionWeb3 = () => {
  const [isConnection, setIsConnection] = useState(true)
  const { appState } = useAppState()
  const store = SimpleStore.useStore()
  const wallet = store.get('wallet')
  const isWeb3Connection = useCallback(async () => {
    if (wallet) {
      log.debug('isWeb3Connection')

      //verify a blockchain method works ok (balanceOf)
      if (
        wallet.wallet.currentProvider.connected &&
        (await wallet
          .balanceOf()
          .then(_ => true)
          .catch(_ => false))
      ) {
        log.debug('web3 settings connection back')
        setIsConnection(true)
      } else {
        //if not connected and not reconnecting than try to force reconnect
        if (wallet.wallet.currentProvider.reconnecting === false) {
          wallet.wallet.currentProvider.reconnect()
        }
        log.debug('web3 settings connection lost')
        setIsConnection(false)
      }
    } else {
      setIsConnection(true)
    }
  }, [setIsConnection, wallet])

  const web3Close = useCallback(() => {
    log.debug('web3 close')
    isWeb3Connection()
  }, [isWeb3Connection])

  const web3Error = useCallback(() => {
    log.debug('web3 error')
    isWeb3Connection()
  }, [isWeb3Connection])

  useEffect(() => {
    const bindEvents = method => {
      log.debug('web3 binding listeners', method)

      //websocketprovider (https://github.com/ethereum/web3.js/issues/3500) provider has bug not calling events correctly, so we subscribe directly to websocket connection
      const callMethod = method === 'remove' ? 'removeEventListener' : 'addEventListener'
      const connection = get(wallet, 'wallet.currentProvider.connection')
      if (connection === undefined) {
        return
      }
      connection[callMethod]('close', web3Close)
      connection[callMethod]('error', web3Error)
    }

    const onReady = () => {
      bindEvents('remove')
      bindEvents('add')
      isWeb3Connection()
    }
    const onErrorClose = () => {
      isWeb3Connection()
    }
    const subscribe = method => {
      wallet.wallet.currentProvider[method]('ready', onReady)
      wallet.wallet.currentProvider[method]('error', onErrorClose)
      wallet.wallet.currentProvider[method]('close', onErrorClose)
    }
    if (wallet && appState === 'active') {
      log.debug('subscribing', wallet, appState, isWeb3Connection)
      subscribe('on')
      isWeb3Connection()
    } else if (wallet && appState !== 'active') {
      subscribe('off')
    }
    return () => wallet && subscribe('off') && bindEvents('remove')
  }, [wallet, appState, isWeb3Connection])

  return isConnection
}

export const useConnectionGun = () => {
  const [isConnection, setIsConnection] = useState(true)
  const store = SimpleStore.useStore()
  const userStorage = store.get('userStorage')
  const websocket = useRef(undefined)
  const { appState } = useAppState()
  const gunUrl = Config.gunPublicUrl.split(',')[0]
  const isGunConnection = () => {
    if (userStorage) {
      const connection = get(userStorage, `gun._.opt.peers`, [])[gunUrl]
      const readyState = get(connection, 'wire.readyState')
      log.debug('gun connection:', connection, userStorage.gun._.opt.peers)
      if (readyState && readyState === connection.wire.OPEN) {
        setIsConnection(true)
        bindEvents('add')
      } else {
        setIsConnection(false)
        setTimeout(isGunConnection, 1000)
      }
    } else {
      setIsConnection(true)
    }
  }

  const gunClose = useCallback(() => {
    log.debug('gun close')
    isGunConnection()
  }, [isGunConnection])

  const gunError = useCallback(() => {
    log.debug('gun error')
    isGunConnection()
  }, [isGunConnection])

  const bindEvents = useCallback(
    method => {
      const connection = get(userStorage, `gun._.opt.peers`, [])[gunUrl] || {}
      const wire = connection.wire
      if (wire && (websocket.current !== wire || method === 'remove')) {
        log.debug('gun binding listeners')
        websocket.current = wire
        const callMethod = method === 'remove' ? 'removeEventListener' : 'addEventListener'
        log.debug('add gun binding listeners', { method })

        //guns reconnect automatically so no action required on our side
        wire[callMethod]('close', gunClose)
        wire[callMethod]('error', gunError)
      }
    },
    [userStorage, websocket],
  )

  useEffect(() => {
    if (userStorage && appState === 'active') {
      isGunConnection()
      return () => bindEvents('remove')
    }
  }, [userStorage, appState, bindEvents])

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
