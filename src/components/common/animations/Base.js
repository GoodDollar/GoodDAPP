import React from 'react'
import { cloneDeep } from 'lodash'

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

  initAnimation = () => {
    if (this.anim) {
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
