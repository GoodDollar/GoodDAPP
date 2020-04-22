import { useEffect, useState } from 'react'
import { AppState } from 'react-native'

export default settings => {
  const { onChange, onForeground, onBackground } = settings || {}
  const [appState, setAppState] = useState(AppState.currentState)

  useEffect(() => {
    const handleAppStateChange = nextAppState => {
      if (nextAppState === 'active') {
        isValidFunction(onForeground) && onForeground()
      } else if (appState === 'active' && nextAppState.match(/inactive|background/)) {
        isValidFunction(onBackground) && onBackground()
      }
      setAppState(nextAppState)
      appState !== nextAppState && isValidFunction(onChange) && onChange(nextAppState)
    }
    AppState.addEventListener('change', handleAppStateChange)

    return () => AppState.removeEventListener('change', handleAppStateChange)
  }, [settings])

  // settings validation
  function isValidFunction(func) {
    return func && typeof func === 'function'
  }
  return { appState }
}
