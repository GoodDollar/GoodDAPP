// @flow
import React from 'react'
// import LottieView from 'lottie-react-native'
// const animationData = require('./data.json')

import img_0 from './images/img_0.png'
import img_1 from './images/img_1.png'
import img_2 from './images/img_2.png'
import img_3 from './images/img_3.png'
import img_4 from './images/img_4.png'
import img_5 from './images/img_5.png'
import img_6 from './images/img_6.png'
import img_7 from './images/img_7.png'
import img_8 from './images/img_8.png'
import img_9 from '../../assets/images/img_9.png'
import { Image , View} from "react-native"

Image.prefetch(img_0)
Image.prefetch(img_1)
Image.prefetch(img_2)
Image.prefetch(img_3)
Image.prefetch(img_4)
Image.prefetch(img_5)
Image.prefetch(img_6)
Image.prefetch(img_7)
Image.prefetch(img_8)
Image.prefetch(img_9)
console.log('!!!!!!!', {
  img_0,
  img_1,
  img_2,
  img_3,
  img_4,
  img_5,
  img_6,
  img_7,
  img_8,
  img_9,
})
type Props = {
  screenProps: any,
}
type State = {}
export default class SignUpCompletedAnimation extends React.Component<Props, State> {
  componentDidMount() {
    // this.animation.play()
  }

  render() {
    return (
      <View>
        <Image source={{uri:img_9}}/>
      {/*<LottieView*/}
      {/*  source={animationData}*/}
      {/*  ref={animation => {*/}
      {/*    this.animation = animation*/}
      {/*  }}*/}
      {/*/>*/}
      </View>
    )
  }
}
