import { useEffect, useState } from 'react'

import Config from '../../config/config'
import { fireEvent } from '../analytics/analytics'
import AsyncStorage from '../utils/asyncStorage'
import { AB_TESTING } from '../constants/localStorage'
import logger from '../logger/pino-logger'

const log = logger.child({ from: 'useABTesting' })

const createABTesting = (testName, percentage = Config.abTestPercentage, persistVariant = true) => {
  const ready = (async () => {
    const tests = (persistVariant && (await AsyncStorage.getItem(AB_TESTING))) || {}
    let test = tests[testName]
    if (test == null) {
      test = { name: testName }
      test.random = Math.random()
      test.isCaseA = test.random < percentage
      test.ab = test.isCaseA ? 'A' : 'B'
      tests[testName] = test
      persistVariant && AsyncStorage.setItem(AB_TESTING, tests)
    }
    log.debug('got test variant', { tests, test, persistVariant })
    return test
  })()

  const useABTesting = (componentA, componentB, event = null) => {
    const [test, setTest] = useState({})
    const component = test.isCaseA ? componentA : componentB

    useEffect(() => {
      const init = async () => {
        const test = await ready
        const { ab } = test
        void (event && fireEvent(event, { ab }))
        setTest(test)
        log.debug('hook ready', { test })
      }
      init()
    }, [])

    return [component, test.ab]
  }

  return { useABTesting, testPromise: ready }
}

export default createABTesting
