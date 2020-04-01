import { useRef, useEffect } from 'react'

export default () => {
  const mountedState = useRef(false)

  useEffect(() => {
    mountedState.current = true

    return () => mountedState.current = false
  }, [])

  return mountedState
}
