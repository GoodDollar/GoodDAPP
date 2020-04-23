import { useEffect, useState } from 'react'
import { AppState } from 'react-native'

export default settings => {
  const { onChange, onForeground, onBackground } = settings || {}
  const [appState, setAppState] = useState(AppState.currentState)

  useEffect(() => {
    const handleAppStateChange = nextAppState => {
      if (appState !== nextAppState) {
        const cb = nextAppState === 'active' ? onForeground : onBackground
        cb()
        onChange(nextAppState)
      }
      setAppState(nextAppState)
    }
    AppState.addEventListener('change', handleAppStateChange)

    return () => AppState.removeEventListener('change', handleAppStateChange)
  }, [appState, settings])

  return { appState }
}
