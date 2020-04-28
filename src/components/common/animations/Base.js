import React from 'react'

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

  initAnimation() {
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
