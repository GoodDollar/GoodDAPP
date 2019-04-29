/* eslint-disable no-undef */
// @flow
import loadjs from 'loadjs'
import { Camera } from './Camera.web'
import API from '../../../lib/API/api'
import React, { createRef } from 'react'
import { normalize } from 'react-native-elements'
import logger from '../../../lib/logger/pino-logger'
import { StyleSheet } from 'react-native'
import { Title, Description, Wrapper } from '../components'
import { Section } from '../../common'
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
      log.info('ZoomSDK initialized and preloaded', ZoomSDK)
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
    const { screenProps } = this.props
    log.info(screenProps)

    return (
      <Wrapper valid={true} handleSubmit={this.handleSubmit} submitText="" footerComponent={() => null}>
        <Title>{`${screenProps.data.fullName},\n Welcome to the liveness test`}</Title>
        <Description style={styles.description}>Please follow test instructions</Description>
        <Section style={styles.bottomSection}>
          <div id="zoom-parent-container" style={videoContainerStyles}>
            <div id="zoom-interface-container">
              {this.state.ready && <Camera height={this.height} onLoad={this.onCameraLoad} />}
            </div>
          </div>
        </Section>
      </Wrapper>
    )
  }
}

const styles = StyleSheet.create({
  description: {
    fontSize: normalize(20)
  },
  bottomSection: {
    flex: 1,
    backgroundColor: '#fff'
  }
})

const videoContainerStyles = {
  height: normalize(360),
  marginLeft: 'auto',
  marginRight: 'auto',
  marginTop: 0,
  marginBottom: 0
}
