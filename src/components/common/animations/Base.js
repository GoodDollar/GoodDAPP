import React from 'react'
import { cloneDeep, once } from 'lodash'
import { AppState } from 'react-native'
import { isIOSNative, isMobileNative } from '../../../lib/utils/platform'

class AnimationBase extends React.Component {
  componentDidMount() {
    this.initAnimation()

    if (!isIOSNative) {
      return
    }

    this.subscription = AppState.addEventListener('change', this.handleAppStateChange)
  }

  componentWillUnmount() {
    if (this.anim) {
      if (!isMobileNative) {
        this.anim.destroy()
      }
    }

    this.onUnmount && this.onUnmount()

    if (!isIOSNative || !this.subscription) {
      return
    }

    this.subscription.remove()
  }

  handleAppStateChange = nextAppState => {
    if (nextAppState === 'active' && this.anim) {
      this.anim.play()
    }
  }

  started = once(() => {
    this.onStart && this.onStart()
  })

  initAnimation = () => {
    if (this.anim) {
      if (!isMobileNative) {
        this.anim.addEventListener('enterFrame', this.started)
      }
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
