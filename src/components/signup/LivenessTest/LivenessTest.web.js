/* eslint-disable no-undef */
// @flow
import './LivenessTest.css'
import loadjs from 'loadjs'
import { Camera } from './Camera.web'
import API from '../../../lib/API/api'
import React, { createRef } from 'react'
import { normalize } from 'react-native-elements'
import logger from '../../../lib/logger/pino-logger'
import { StyleSheet, View, Text } from 'react-native'
import { Wrapper, Title, Description } from '../components'
import { wrapFunction } from '../../../lib/undux/utils/wrapper'
import { initializeAndPreload, capture, ZoomCaptureResult } from './Zoom'

type Props = {
  screenProps: any
  //onCaptureComplete: (captureResult: ZoomCaptureResult) => void, // TODO: pass using screenProps? Need to pass down proper function to handle capture completed - in case of register flow, and in case of login flow.
  //onCaptureError: (captureError: ApiError) => void
}

type State = {
  showZoom: boolean,
  ready: boolean
}

const log = logger.child({ from: 'LivenessTest' })

export default class LivenessTest extends React.Component<Props, State> {
  state = {
    showZoom: true,
    ready: false
  }
  handleSubmit = () => null

  containerRef = createRef()
  width = 720
  height = 0

  async componentDidMount() {
    const containerWidth =
      (this.containerRef && this.containerRef.current && this.containerRef.current.offsetWidth) || this.width
    this.width = Math.min(this.width, containerWidth)
    this.height = window.innerHeight > window.innerWidth ? this.width * 1.77777778 : this.width * 0.5625

    this.width = 720
    this.height = 1280
  }

  async componentWillMount() {
    try {
      await this.loadZoomSDK()
      log.info('ZoomSDK loaded', ZoomSDK)
      await initializeAndPreload(ZoomSDK) // TODO: what to do in case of init errors?
      this.setState({ ready: true })
    } catch (e) {
      log.error(e)
    }
  }

  loadZoomSDK = async (): Promise<void> => {
    global.exports = {} // required by zoomSDK
    const zoomSDKPath = 'https://cdn.jsdelivr.net/gh/GoodDollar/ZoomSDK/ZoomAuthentication.js/ZoomAuthentication.js'
    log.info(`loading ZoomSDK from ${zoomSDKPath}`)
    return loadjs(zoomSDKPath, { returnPromise: true })
  }

  onCaptureComplete = async (captureResult: ZoomCaptureResult) => {
    log.info({ captureResult })
    await API.enroll(captureResult)
    this.props.screenProps.doneCallback({}) // call it when the face recognition is over successfully
  }

  onCameraLoad = async (track: MediaStreamTrack) => {
    let captureOutcome: ZoomCaptureResult

    try {
      captureOutcome = await capture(track)
    } catch (e) {
      //return this.props.screenProps.onCaptureError(e)
      log.error(`Failed on capture, error: ${e}`)
    }
    // this.props.screenProps.onCaptureComplete(captureOutcome)
    this.onCaptureComplete(captureOutcome)
  }

  render() {
    const height = this.height
    const width = this.width

    return (
      <Wrapper valid={true} handleSubmit={this.handleSubmit} submitText="" footerComponent={() => null}>
        <Title>{`${this.props.screenProps.data.fullName},\n Welcome to the liveness test`}</Title>
        <Description style={styles.description}>{'Pleae follow test instructions'}</Description>
        <div
          id="zoom-parent-container"
          style={{
            width: `640px`,
            height: `360px`
          }}
        >
          <div id="zoom-interface-container">
            {this.state.ready && <Camera width={this.width} height={this.height} onLoad={this.onCameraLoad} />}
          </div>
        </div>
      </Wrapper>
    )
  }
}

const styles = StyleSheet.create({
  description: {
    fontSize: normalize(20)
  }
})
