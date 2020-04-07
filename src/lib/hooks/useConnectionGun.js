import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import Config from '../../config/config'
import logger from '../logger/pino-logger'
import SimpleStore from '../undux/SimpleStore'

let isFirstCheckGun = false
let needToBindEventsGun = true

const log = logger.child({ from: 'useHasConnectionGun' })

export default () => {
  const [isConnection, setIsConnection] = useState(false)
  const store = SimpleStore.useStore()
  const userStorage = store.get('userStorage')
  const connectionCheck = useRef()

  /**
   * Kills the last connection listener alive.
   */
  const killLastConnectionCheck = () => {
    if (typeof connectionCheck.current === 'function') {
      connectionCheck.current()
      connectionCheck.current = null
    }
  }

  /**
   * isGunConnection gets recursive when the connection fails, so it returns a function to kill
   * the recursion.
   */
  const isGunConnection = useCallback(() => {
    killLastConnectionCheck()

    /**
     * Nothing to do if the app is in background
     */
    if (!userStorage || AppState.currentState !== 'active') {
      log.debug('nothing to do', userStorage, AppState.currentState)
      return
    }

    if (!isFirstCheckGun) {
      isFirstCheckGun = true
    }

    const instanceGun = userStorage.gun._
    const connection = instanceGun.opt.peers[Config.gunPublicUrl]
    log.debug('gun connection:', connection)

    const isConnected = connection && connection.wire && connection.wire.readyState === connection.wire.OPEN

    setIsConnection(isConnected)

    if (isConnected) {
      if (needToBindEventsGun) {
        needToBindEventsGun = false
        bindEvents('add')
      }
    } else {
      if (!needToBindEventsGun) {
        bindEvents('remove')
        needToBindEventsGun = true
      }

      /**
       * If connection fails, it tries again and saves the id of the timer
       * returned by setTimeout so it can be cleared.
       */
      let next = setTimeout(isGunConnection, 1000)

      connectionCheck.current = () => clearTimeout(next)
    }
  }, [AppState.currentState, userStorage])

  const gunClose = useCallback(() => {
    log.debug('gun close')
    isGunConnection()
  }, [isGunConnection])

  const gunError = useCallback(() => {
    log.debug('gun error')
    isGunConnection()
  }, [isGunConnection])

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
    if (!userStorage) {
      return
    }

    const onAppStateChange = nextAppState => {
      if (nextAppState === 'active') {
        isGunConnection()
      } else {
        /**
         * Kill the last listener if the app is dismissed
         */
        killLastConnectionCheck()
      }
    }

    AppState.addEventListener('change', onAppStateChange)

    if (!isFirstCheckGun) {
      isGunConnection()
    }

    /**
     * Returns an unsubscribe function to kill the listeners when the effect dies
     */
    return () => {
      killLastConnectionCheck()
      AppState.removeEventListener('change', onAppStateChange)
    }
  }, [isGunConnection, userStorage])

  return isConnection
}
