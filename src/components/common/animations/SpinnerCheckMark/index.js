import React, { useCallback, useState } from 'react'
import SpinnerCheckMark from './SpinnerCheckMark'

export default props => {
  const { loading, success, onFinish } = props
  const shouldPlay = loading || success
  const [isDone, setIsDone] = useState(false)
  const onFinishHandle = useCallback(() => {
    setIsDone(true)
    onFinish && onFinish()
  })

  if (shouldPlay === false || isDone === true) {
    return props.children || null
  }

  return <SpinnerCheckMark {...props} success={success} onFinish={onFinishHandle} />
}
