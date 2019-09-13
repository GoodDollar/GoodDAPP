// @flow
import React from 'react'
import LottieView from 'lottie-react-native'
import animationData from './data.json'

type Props = {
  screenProps: any,
}
type State = {}
export default class SignUpCompletedAnimation extends React.Component<Props, State> {
  componentDidMount() {
    this.animation.play()
  }

  render() {
    return (
      <LottieView
        source={animationData}
        ref={animation => {
          this.animation = animation
        }}
      />
    )
  }
}
