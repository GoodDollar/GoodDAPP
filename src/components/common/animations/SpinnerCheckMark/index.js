import React, { useCallback, useState } from 'react'

// import logger from '../../../../lib/logger/js-logger'
import SpinnerCheckMark from './SpinnerCheckMark'

// const log = logger.child({ from: 'SpinnerCheckmark' })
export default props => {
  const { loading, success, onFinish } = props
  const shouldPlay = loading || success
  const [isDone, setIsDone] = useState(false)
  const onFinishHandle = useCallback(() => {
    setIsDone(true)
    onFinish && onFinish()
  })

  // log.debug({ shouldPlay, isDone })
  if (shouldPlay === false || isDone === true) {
    return props.children || null
  }

  return <SpinnerCheckMark {...props} success={success} onFinish={onFinishHandle} />
}
