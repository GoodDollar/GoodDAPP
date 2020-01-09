import React, { useEffect, useRef, useState } from 'react'
import Lottie from 'lottie-react-web'
import animationData from './data.json'

const spinnerSegment = [0, 131]
const finishSegment = [131, 290]
const defaultOptions = {
  animationData,
  autoplay: false,
  loop: true,
}
export default props => {
  const { height = 196, width = 196, onFinish, success } = props
  const [animationSuccess, setAnimationSuccess] = useState(false)
  const animationRef = useRef()
  useEffect(() => {
    animationRef.current.anim.onComplete = () => {
      if (typeof onFinish === 'function') {
        onFinish()
      }
    }
    animationRef.current.anim.playSegments(spinnerSegment, true)
  }, [])

  useEffect(() => {
    if (success && !animationSuccess) {
      animationRef.current.anim.playSegments(finishSegment)
      animationRef.current.anim.loop = false
      setAnimationSuccess(true)
    }
  }, [success])

  return (
    <Lottie
      style={{
        marginTop: -height / 2.4,
      }}
      options={defaultOptions}
      ref={animationRef}
      animationData={animationData}
      height={height}
      width={width}
    />
  )
}
