import { useCallback, useEffect, useRef, useState } from 'react'

const defaultDelay = 500

export const useDebouncedValue = (value, delay = defaultDelay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

export default (callback, options = null) => {
  const { delay = defaultDelay, leading = false } = options || {}
  const lastCallbackRef = useRef(null)
  const supressCallRef = useRef(false)

  return useCallback(() => {
    if (lastCallbackRef.current) {
      clearTimeout(lastCallbackRef)
    }

    if (!leading) {
      lastCallbackRef.current = setTimeout(callback, delay)
      return
    }

    if (!supressCallRef.current) {
      supressCallRef.current = true
      callback()
    }

    lastCallbackRef.current = setTimeout(() => (supressCallRef.current = false), delay)
  }, [callback, delay, leading])
}
