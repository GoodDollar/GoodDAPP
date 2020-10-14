import { useCallback, useRef } from 'react'
import { isNil } from 'lodash'

const useOnPress = (callback, deps = []) =>
  useCallback(
    event => {
      if (event) {
        event.preventDefault()
      }

      return callback(event)
    },
    [callback, ...deps],
  )

export const useDebouncedOnPress = (callback, deps = []) => {
  const nextInvokationRef = useRef(null)

  return useOnPress(
    event => {
      const nextInvokation = nextInvokationRef.current
      const currentTs = Date.now()

      if (isNil(nextInvokation) || currentTs >= nextInvokation) {
        callback(event)
      }

      nextInvokationRef.current = currentTs + 500
    },
    [callback, ...deps],
  )
}

export default useOnPress
