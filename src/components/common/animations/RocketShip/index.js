import React, { useCallback, useEffect, useState } from 'react'
import RocketShip from './RocketShip'

export default props => {
  const { loading, success, onFinish } = props
  const [isStarting, setIsStarting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const onFinishHandle = useCallback(() => {
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
    return props.children || null
  }

  return <RocketShip {...props} success={isSuccess} onFinish={onFinishHandle} />
}
