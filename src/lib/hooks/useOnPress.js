import { useCallback } from 'react'

export default (callback, deps = []) => {
  const memoizedCallback = useCallback(callback, deps)

  return useCallback(
    event => {
      event.preventDefault()

      return memoizedCallback(event)
    },
    [memoizedCallback]
  )
}
