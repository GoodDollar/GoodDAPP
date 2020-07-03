import React from 'react'
import { cloneDeep } from 'lodash'
import { isMobileNative } from '../../../lib/utils/platform'

class AnimationBase extends React.Component {
  componentDidMount() {
    this.initAnimation()
  }

  componentWillUnmount() {
    if (this.anim) {
      if (!isMobileNative) {
        this.anim.destroy()
      }
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
        throw new Error()
      }
    } catch {
      result = cloneDeep(animationData)
    }

    return result
  }
}

export default AnimationBase
