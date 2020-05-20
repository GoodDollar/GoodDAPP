import { useEffect, useRef } from 'react'

export default () => {
  const mountedState = useRef(false)

  useEffect(() => {
    mountedState.current = true

    return () => (mountedState.current = false)
  }, [])

  return mountedState
}
