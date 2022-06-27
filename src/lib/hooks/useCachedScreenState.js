import { useEffect } from 'react'
import { isEmpty, isPlainObject } from 'lodash'

import { useScreenState } from '../../components/appNavigation/stackNavigation'

import AsyncStorage from '../utils/asyncStorage'

export default (screenProps, cacheKey) => {
  const [screenState, setScreenState] = useScreenState(screenProps)

  useEffect(() => {
    const dispose = () => void AsyncStorage.removeItem(cacheKey)

    if (!isEmpty(screenState)) {
      AsyncStorage.safeSet(cacheKey, screenState)
      return dispose
    }

    AsyncStorage.getItem(cacheKey).then(state => {
      if (!isPlainObject(state)) {
        return
      }

      setScreenState(state)
    })

    return dispose
  }, [screenProps])

  return screenState
}
