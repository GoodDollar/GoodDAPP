import React, { useEffect, useState } from 'react'

import { IS_LOGGED_IN } from '../lib/constants/localStorage'
import AsyncStorage from '../lib/utils/asyncStorage'
import { useCurriedSetters } from '../lib/undux/SimpleStore'
import AppHot from './AppHot'

const AppStore = () => {
  const [ready, setReady] = useState(false)
  const [setIsLoggedIn] = useCurriedSetters(['isLoggedIn'])

  useEffect(() => {
    AsyncStorage.getItem(IS_LOGGED_IN)
      .then(setIsLoggedIn)
      .then(() => setReady(true))
  }, [setReady])

  return ready ? <AppHot /> : null
}

export default AppStore
