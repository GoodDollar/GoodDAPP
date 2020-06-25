import { useCallback } from 'react'

import SimpleStore from '../undux/SimpleStore'

import { hideLoadingIndicator, showLoadingIndicator, toggleLoadingIndicator } from '../undux/utils/loading'

export default () => {
  const store = SimpleStore.useStore()

  const showLoading = useCallback(() => showLoadingIndicator(store), [store])
  const hideLoading = useCallback(() => hideLoadingIndicator(store), [store])
  const toggleLoading = useCallback(loading => toggleLoadingIndicator(store, loading), [store])

  return [showLoading, hideLoading, toggleLoading]
}
