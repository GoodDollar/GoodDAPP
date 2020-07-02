import React from 'react'
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
}

export default AnimationBase
