import { useCallback, useContext } from 'react'

import { GlobalTogglesContext } from '../contexts/togglesContext'

export default () => {
  const { setLoading } = useContext(GlobalTogglesContext)

  const showLoading = useCallback(() => setLoading(true), [setLoading])
  const hideLoading = useCallback(() => setLoading(false), [setLoading])

  return [showLoading, hideLoading]
}
