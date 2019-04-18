// @flow
import React from 'react'
import { Camera } from './Camera'
import { StyleSheet, View, Text } from 'react-native'
import { Wrapper, Title, Description } from './components'
import { normalize } from 'react-native-elements'
import { wrapFunction } from '../../lib/undux/utils/wrapper' // use for error handling
type Props = {
  screenProps: any
}
type State = {
  showZoom: boolean
}
export default class LivenessTest extends React.Component<Props, State> {
  state = {
    showZoom: true
  }
  handleSubmit = () => {
    // Show LivelinessCapture.tx UI.
    /*wrapFunction( // see in ReceieveByQR.web line 61 the usage.
      // ... 
    )*/
    // Show face reco client.
    //this.props.screenProps.doneCallback({}) // call it when the face recognition is over successfully
    // if something fails
  }

  onCameraLoad = async (track: MediaStreamTrack) => {
    let captureOutcome: ZoomCaptureResult

    try {
      //TODO: uncomment:      captureOutcome = await capture(track)
    } catch (e) {
      return this.props.onCaptureError(e) //TODO: use wrap instead
    }

    // this.props.onCaptureComplete(captureOutcome) // TODO: implement locally
  }

  render() {
    const { showZoom } = this.state
    return (
      <Wrapper valid={true} handleSubmit={this.handleSubmit} submitText="">
        <Title>{`${this.props.screenProps.data.fullName},\n Welcome to the liveness test`}</Title>
        <Description style={styles.description}>{'Pleae follow test instructions'}</Description>
        <View>
          <Camera width={this.width} height={this.height} onLoad={this.onCameraLoad.bind(this)} />
        </View>
      </Wrapper>
    )
  }
}

const styles = StyleSheet.create({
  description: {
    fontSize: normalize(20)
  }
})
