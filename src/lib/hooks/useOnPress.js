import { useCallback, useMemo, useRef } from 'react'
import { isFunction, isNil } from 'lodash'

export const preventPressed = event => {
  let shouldPrevent = event && isFunction(event.preventDefault)

  if (shouldPrevent && 'defaultPrevented' in event) {
    shouldPrevent = !event.defaultPrevented
  }

  if (shouldPrevent) {
    event.preventDefault()
  }
}

const useOnPress = (callback, deps = []) => {
  const wrappedCallback = useCallback(
    event => {
      preventPressed(event)
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
