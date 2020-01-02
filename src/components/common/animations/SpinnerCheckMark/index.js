import React, { useCallback, useEffect, useState } from 'react'
import SpinnerCheckMark from './SpinnerCheckMark'

export default props => {
  const { loading, success } = props
  const [isStarting, setIsStarting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const onFinish = useCallback(() => {
    setIsStarting(false)
    setIsSuccess(false)
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

  return <SpinnerCheckMark {...props} success={isSuccess} onFinish={onFinish} />
}
