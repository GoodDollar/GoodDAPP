import { useCallback } from 'react'

import { debounce, identity } from 'lodash'

const debounceWrapper = callback => debounce(callback, 500, { leading: true, trailing: false })

const useOnPressHook = (callback, deps = [], options = {}) => {
  const { debounce = false } = options
  const memoizedCallback = useCallback(callback, deps)
  const wrapper = debounce ? debounceWrapper : identity

  return useCallback(
    wrapper(event => {
      event.preventDefault()

      return memoizedCallback(event)
    }),
    [memoizedCallback],
  )
}

export const useDebouncedOnPress = (callback, deps = []) => useOnPressHook(callback, deps, { debounce: true })

export default (callback, deps = []) => useOnPressHook(callback, deps)
