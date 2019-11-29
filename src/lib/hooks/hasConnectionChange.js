import { useEffect, useState } from 'react'
import { NetInfo } from 'react-native'
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
