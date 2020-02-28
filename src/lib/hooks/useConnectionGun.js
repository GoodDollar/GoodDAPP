import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import Config from '../../config/config'
import logger from '../logger/pino-logger'
import SimpleStore from '../undux/SimpleStore'

let isFirstCheckGun = false
let needToBindEventsGun = true

const log = logger.child({ from: 'useHasConnectionGun' })

export default () => {
  const [isConnection, setIsConnection] = useState(true)
  const store = SimpleStore.useStore()
  const userStorage = store.get('userStorage')
  const connectionCheck = useRef()

  const killLastConnectionCheck = () => {
    if (typeof connectionCheck.current === 'function') {
      connectionCheck.current()
      connectionCheck.current = null
    }
  }

  const isGunConnection = useCallback(() => {
    killLastConnectionCheck()

    if (!userStorage || AppState.currentState !== 'active') {
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

      let next = setTimeout(() => {
        next = isGunConnection()
      }, 1000)

      return () => clearTimeout(next)
    }
  })

  const gunClose = useCallback(() => {
    log.debug('gun close')
    connectionCheck.current = isGunConnection()
  }, [])

  const gunError = useCallback(() => {
    log.debug('gun error')
    connectionCheck.current = isGunConnection()
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
    if (!userStorage) {
      return
    }

    const onAppStateChange = nextAppState => {
      if (nextAppState === 'active') {
        connectionCheck.current = isGunConnection()
      } else {
        killLastConnectionCheck()
      }
    }

    AppState.addEventListener('change', onAppStateChange)

    if (!isFirstCheckGun) {
      connectionCheck.current = isGunConnection()
    }

    return () => {
      killLastConnectionCheck()
      AppState.removeEventListener('change', onAppStateChange)
    }
  }, [isGunConnection, userStorage])

  return isConnection
}
