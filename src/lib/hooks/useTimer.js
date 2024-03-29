import { useCallback, useEffect, useState } from 'react'

import moment from 'moment'
import setupDurationFormat from 'moment-duration-format'

import useInterval from './useInterval'

setupDurationFormat(moment)

const getTimerState = targetTime => {
  const duration = moment.duration(moment(targetTime).diff(moment()))
  const isReachedZero = targetTime !== undefined && duration.asMilliseconds() <= 0
  const countdown = isReachedZero || !targetTime ? '00:00:00' : duration.format('HH:mm:ss', { trim: false })

  return [countdown, isReachedZero]
}

const useTimer = tillTime => {
  const [targetTime, setTargetTime] = useState(tillTime)
  const [timerState, setTimerState] = useState(() => getTimerState(targetTime))
  const [countdown, isReachedZero] = timerState

  const onTick = useCallback(() => {
    setTimerState(getTimerState(targetTime))
  }, [targetTime, setTimerState])

  const [start, stop] = useInterval(onTick, 1000, false)

  useEffect(() => {
    start()

    return stop
  }, [start, stop, targetTime])

  useEffect(() => {
    if (isReachedZero) {
      stop()
    }
  }, [isReachedZero, stop])

  return [countdown, isReachedZero, setTargetTime]
}

export default useTimer
