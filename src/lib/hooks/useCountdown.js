import { useCallback, useEffect, useState } from 'react'
import useInterval from './useInterval'

const useCountdown = seconds => {
  const [counter, setCounter] = useState(seconds)

  const onTick = useCallback(() => setCounter(current => (current > 0 ? current - 1 : 0)), [setCounter])

  useEffect(() => setCounter(seconds), [seconds])
  useInterval(onTick)

  return counter
}

export default useCountdown
