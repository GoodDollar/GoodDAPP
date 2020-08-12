import React from 'react'
import { cloneDeep, once } from 'lodash'

class AnimationBase extends React.Component {
  componentDidMount() {
    this.initAnimation()
  }

  componentWillUnmount() {
    if (this.anim) {
      this.anim.destroy()
    }

    this.onUnmount && this.onUnmount()
  }

  started = once(() => {
    this.onStart && this.onStart()
  })

  initAnimation = () => {
    if (this.anim) {
      this.anim.addEventListener('enterFrame', this.started)
      this.onMount && this.onMount()
    } else {
      setTimeout(() => {
        this.initAnimation()
      }, 100)
    }
  }

  setAnim = anim => (this.anim = anim)

  improveAnimationData = animationData => {
    let result

    try {
      result = JSON.parse(JSON.stringify(animationData))

      if (typeof result === 'undefined') {
        throw new Error('failed parsing animation json')
      }
    } catch {
      result = cloneDeep(animationData)
    }

    return result
  }
}

export default AnimationBase
