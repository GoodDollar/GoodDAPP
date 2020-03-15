import { useCallback, useEffect, useState } from 'react'
import API from '../API/api'
import { delay } from '../utils/async'
import logger from '../logger/pino-logger'
export { default as useConnectionWeb3 } from './useConnectionWeb3'
export { default as useConnectionGun } from './useConnectionGun'
export { default as useConnection } from './useConnection'

const log = logger.child({ from: 'hasConnectionChange' })

export const useAPIConnection = () => {
  const [isConnection, setIsConnection] = useState(false)

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
