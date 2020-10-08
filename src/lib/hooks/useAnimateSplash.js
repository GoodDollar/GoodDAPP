import { useCallback, useEffect, useState } from 'react'
import { isUndefined } from 'lodash'
import moment from 'moment'

import AsyncStorage from '../utils/asyncStorage'

// shared flag
let animateSplash

const storageKey = 'GD_lastSplash'
export const shouldAnimateSplash = () => animateSplash || false

export default () => {
  const [ready, setReady] = useState(false)
  const reset = useCallback(() => AsyncStorage.removeItem(storageKey), [])

  useEffect(() => {
    if (!isUndefined(animateSplash)) {
      return
    }

    AsyncStorage.getItem(storageKey).then(lastSplash => {
      animateSplash = !lastSplash || moment().diff(lastSplash, 'hours') >= 1
      setReady(true)

      if (animateSplash) {
        AsyncStorage.setItem(storageKey, Date.now())
      }
    })
  }, [])

  return [ready, animateSplash, reset]
}
