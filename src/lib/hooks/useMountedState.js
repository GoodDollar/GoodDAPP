import { useCallback, useEffect, useRef } from 'react'

export default () => {
  const mountedState = useRef(false)
  const mountedPromise = useRef()

  const onMount = useCallback(callbackFn => {
    mountedPromise.current.promise.then(callbackFn)
  }, [])

  ;(() => {
    if (mountedPromise.current) {
      return
    }

    let resolve
    const promise = new Promise(_resolve => (resolve = _resolve))

    mountedPromise.current = { promise, resolve }
  })()

  useEffect(() => {
    mountedState.current = true
    mountedPromise.current.resolve()

    return () => (mountedState.current = false)
  }, [])

  return [mountedState, onMount]
}
