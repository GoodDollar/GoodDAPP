import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'

const useInterval = (callback, delay = 1000, autoStart = true) => {
  const callbackRef = useRef(callback)
  const intervalRef = useRef(null)

  const stop = useCallback(() => {
    if (!intervalRef.current) {
      return
    }

    clearInterval(intervalRef.current)
    intervalRef.current = null
  }, [])

  const start = useCallback(() => {
    stop()
    intervalRef.current = setInterval(() => callbackRef.current(), delay)
  }, [stop, delay])

  useLayoutEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (autoStart || intervalRef.current) {
      start()
    }

    return stop
  }, [autoStart, start, stop])

  return [start, stop]
}

export default useInterval
