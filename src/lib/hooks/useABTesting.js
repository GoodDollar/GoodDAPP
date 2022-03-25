//@flow
import { useEffect, useRef, useState } from 'react'
import { get, isUndefined, once, pick } from 'lodash'
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
    const optionSelectedRef = useRef(false)

    useEffect(() => {
      const isEmpty = !options || options.some(({ value }) => isUndefined(value))

      const loadOption = async () => {
        const test = await getTestVariant()
        const option = options.find((opt, idx) => idx === options.length - 1 || test.random <= opt.chance)

        if (event) {
          fireEvent(event, pick(test, 'ab'))
        }

        optionSelectedRef.current = true
        setOption(option)

        log.debug('useOption ready', { option, test })
      }

      if (optionSelectedRef.current || isEmpty) {
        return
      }

      loadOption()
    }, [options])

    return option
  }

  return { useABTesting, useOption }
}

export default createABTesting
