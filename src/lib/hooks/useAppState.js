import { useEffect, useState } from 'react'
import { AppState } from 'react-native'
import { noop as _ } from 'lodash'

export default (settings = {}) => {
  const { onChange = _, onForeground = _, onBackground = _ } = settings
  const [appState, setAppState] = useState(AppState.currentState)

  useEffect(() => {
    const handleAppStateChange = nextAppState => {
      if (appState !== nextAppState) {
        ;(nextAppState === 'active' ? onForeground : onBackground)()
        onChange(nextAppState)
      }

      setAppState(nextAppState)
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)

    return () => {
      subscription.remove()
    }
  }, [appState, onChange, onForeground, onBackground])

  return { appState }
}
