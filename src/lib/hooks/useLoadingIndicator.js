import { useCallback, useContext } from 'react'
import { GlobalTogglesContext } from '../contexts/togglesContext'

export default () => {
  const { isLoadingIndicator, setLoadingIndicator } = useContext(GlobalTogglesContext)

  const showLoading = useCallback(() => setLoadingIndicator(true), [setLoadingIndicator])
  const hideLoading = useCallback(() => setLoadingIndicator(false), [setLoadingIndicator])
  const toggleLoading = useCallback(() => setLoadingIndicator(!isLoadingIndicator), [
    isLoadingIndicator,
    setLoadingIndicator,
  ])

  return [showLoading, hideLoading, toggleLoading]
}
