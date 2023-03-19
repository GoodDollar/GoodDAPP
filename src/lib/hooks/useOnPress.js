import { useCallback, useRef } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { isFunction } from 'lodash'

const useOnPress = (callback, deps = [], preventDoubleClick = true) => {
  const lastClickRef = useRef(0)
  const isCallbackDoneRef = useRef(true)

  const wrappedCallback = useCallback(
    async event => {
      if (
        preventDoubleClick &&
        isCallbackDoneRef.current &&
        lastClickRef.current &&
        Date.now() - lastClickRef.current < 500
      ) {
        return
      }
      isCallbackDoneRef.current = false
      lastClickRef.current = Date.now()
      preventPressed(event)
      try {
        return await callback(event)
      } finally {
        isCallbackDoneRef.current = true
      }
    },
    [callback, ...deps],
  )

  if (callback) {
    return wrappedCallback
  }
}

export const preventPressed = event => {
  let shouldPrevent = event && isFunction(event.preventDefault)

  if (shouldPrevent && 'defaultPrevented' in event) {
    shouldPrevent = !event.defaultPrevented
  }

  if (shouldPrevent) {
    event.preventDefault()
  }
}

export const useDebouncedOnPress = (callback, deps = []) => {
  const debouncedCallback = useDebouncedCallback(callback, 500)

  return useOnPress(debouncedCallback, deps)
}

export default useOnPress
