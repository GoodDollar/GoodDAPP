import React, { useCallback, useEffect, useState } from 'react'
import SpinnerCheckMark from './SpinnerCheckMark'

export default props => {
  const { loading, success, onFinish } = props
  const [isStarting, setIsStarting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const onFinishHandle = useCallback(() => {
    onFinish && onFinish()
    setIsStarting(false)
    setIsSuccess(false)
    onFinish && onFinish()
  })

  useEffect(() => {
    setIsStarting(isStarting || loading)
  }, [loading])

  useEffect(() => {
    setIsSuccess(isSuccess || success)
  }, [success])

  if (!isStarting) {
    return props.children
  }

  return <SpinnerCheckMark {...props} success={isSuccess} onFinish={onFinishHandle} />
}
