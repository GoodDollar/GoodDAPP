//@flow
import { EffectCallback, useEffect, useRef } from 'react'

export const useEffectOnce: typeof useEffect = (effect: EffectCallback) => {
  const initializingRef = useRef(false)

  useEffect(() => {
    if (initializingRef.current) {
      return
    }

    initializingRef.current = true
    return effect()
  }, [effect])
}
