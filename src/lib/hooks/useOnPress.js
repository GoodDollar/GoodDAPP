import { useCallback, useMemo, useRef } from 'react'
import { isFunction, isNil } from 'lodash'

const useOnPress = (callback, deps = []) => {
  const wrappedCallback = useCallback(
    event => {
      if (event && isFunction(event.preventDefault)) {
        event.preventDefault()
      }

      return callback(event)
    },
    [callback, ...deps],
  )

  if (callback) {
    return wrappedCallback
  }
}

export const useDebouncedOnPress = (callback, deps = []) => {
  const nextInvokationRef = useRef(null)

  const debouncedCallback = useMemo(() => {
    if (!callback) {
      return
    }

    return event => {
      const nextInvokation = nextInvokationRef.current
      const currentTs = Date.now()

      if (isNil(nextInvokation) || currentTs >= nextInvokation) {
        callback(event)
      }

      nextInvokationRef.current = currentTs + 500
    }
  }, [callback])

  return useOnPress(debouncedCallback, deps)
}

export default useOnPress
