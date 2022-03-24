//@flow
import { useEffect, useState } from 'react'
import { get, once } from 'lodash'
import Config from '../../config/config'
import { fireEvent } from '../analytics/analytics'
import AsyncStorage from '../utils/asyncStorage'
import { AB_TESTING } from '../constants/localStorage'
import logger from '../logger/js-logger'

const log = logger.child({ from: 'useABTesting' })

const loadPersistedVariants = once(async () => {
  return (await AsyncStorage.getItem(AB_TESTING)) || {}
})

const createABTesting = (testName, percentage = Config.abTestPercentage, persistVariant = true) => {
  const getTestVariant = once(async () => {
    const tests = await loadPersistedVariants()
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
  })

  const useABTesting = (componentA, componentB, event = null) => {
    const [test, setTest] = useState()
    const initialized = test != null
    const component = initialized && test.isCaseA ? componentA : componentB

    useEffect(() => {
      getTestVariant().then(test => {
        const { ab } = test
        void (event && fireEvent(event, { ab }))
        setTest(test)
        log.debug('useABTesting ready', { test })
      })
    }, [])

    return [component, get(test, 'ab'), initialized]
  }

  const useOption = (options: [{ value: any, chance: number }], event = null) => {
    const [option, setOption] = useState()

    useEffect(() => {
      getTestVariant().then(test => {
        const { ab } = test
        void (event && fireEvent(event, { ab }))
        const option = options.find((opt, idx) => idx === options.length - 1 || test.random <= opt.chance)
        setOption(option)
        log.debug('useOption ready', { option, test })
      })
    }, [])

    return option
  }

  return { useABTesting, useOption }
}

export default createABTesting
