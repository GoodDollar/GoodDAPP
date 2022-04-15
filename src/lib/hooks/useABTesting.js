//@flow
import { useEffect, useMemo, useState } from 'react'
import { once, pick } from 'lodash'
import Config from '../../config/config'
import { fireEvent } from '../analytics/analytics'
import AsyncStorage from '../utils/asyncStorage'
import { AB_TESTING } from '../constants/localStorage'
import logger from '../logger/js-logger'
import useRealtimeProps from './useRealtimeProps'

const log = logger.child({ from: 'useABTesting' })

const loadPersistedVariants = once(async () => {
  return (await AsyncStorage.getItem(AB_TESTING)) || {}
})

const generateTestVariant = (name, percentage) => {
  const random = Math.random()
  const isCaseA = random < percentage

  return { name, isCaseA, random, ab: isCaseA ? 'A' : 'B' }
}

const createABTesting = (testName, percentage = Config.abTestPercentage, persistVariant = true) => {
  const getTestVariant = once(async () => {
    const tests = await loadPersistedVariants()
    let test = tests[testName]

    if (!test) {
      test = generateTestVariant()
      tests[testName] = test

      if (persistVariant) {
        await AsyncStorage.setItem(AB_TESTING, tests)
      }
    }

    log.debug('got test variant', { tests, test, persistVariant })
    return test
  })

  const useABTesting = (componentA, componentB, event = null) => {
    const [test, setTest] = useState()
    const [getEvent] = useRealtimeProps([event])

    useEffect(() => {
      getTestVariant().then(test => {
        const { ab } = test
        const event = getEvent()

        if (event) {
          fireEvent(event, { ab })
        }

        setTest(test)
        log.debug('useABTesting ready', { test })
      })
    }, [])

    return useMemo(() => {
      const { ab } = test || {}
      const initialized = !!ab
      let component = null

      if (initialized) {
        component = ab === 'A' ? componentA : componentB
      }

      return [component, ab, initialized]
    }, [test, componentA, componentB])
  }

  const useOption = (options: [{ value: any, chance: number }], event = null) => {
    const [option, setOption] = useState()
    const [optionIndex, setOptionIndex] = useState(-1)

    useEffect(() => {
      getTestVariant().then(test => {
        const optionIndex = options.findIndex((opt, idx) => idx === options.length - 1 || test.random <= opt.chance)

        if (event) {
          fireEvent(event, pick(test, 'ab'))
        }

        log.debug('useOption ready', { optionIndex, test })
        setOptionIndex(optionIndex)
      })
    }, [setOptionIndex])

    useEffect(() => {
      const option = options[optionIndex]

      log.debug('useOption updated', { option })
      setOption(option)
    }, [options, optionIndex])

    return option
  }

  return { getTestVariant, useABTesting, useOption }
}

export default createABTesting
