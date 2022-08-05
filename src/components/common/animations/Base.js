import React from 'react'
import { cloneDeep, once } from 'lodash'
import { isMobileNative } from '../../../lib/utils/platform'

class AnimationBase extends React.Component {
  componentDidMount() {
    this.initAnimation()
  }

  componentWillUnmount() {
    const { anim, onUnmount } = this

    if (anim && !isMobileNative) {
      anim.destroy()
    }

    if (onUnmount) {
      onUnmount()
    }
  }

  started = once(() => {
    const { onStart } = this

    if (onStart) {
      onStart()
    }
  })

  initAnimation = () => {
    const { anim, initAnimation, started, onMount } = this

    if (!anim) {
      setTimeout(initAnimation, 100)
      return
    }

    if (!isMobileNative) {
      anim.addEventListener('enterFrame', started)
    }

    if (onMount) {
      onMount()
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
