import { useCallback, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { isFunction } from 'lodash'

const useOnPress = (callback, deps = [], preventDoubleClick = true) => {
  const [lastClick, setLastClick] = useState(0)

  const wrappedCallback = useCallback(
    event => {
      if (preventDoubleClick && lastClick && Date.now() - lastClick < 500) {
        return
      }
      setLastClick(Date.now())
      preventPressed(event)
      return callback(event)
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
