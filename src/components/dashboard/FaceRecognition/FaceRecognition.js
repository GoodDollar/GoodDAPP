// @flow
import React, { createRef } from 'react'
import SimpleStore from '../../../lib/undux/SimpleStore'
import type { DashboardProps } from '../Dashboard'
import logger from '../../../lib/logger/pino-logger'
import { Wrapper } from '../../common'
import userStorage from '../../../lib/gundb/UserStorage'
import FRapi from './FaceRecognitionAPI'
import type FaceRecognitionResponse from './FaceRecognitionAPI'
import ZoomCapture from './ZoomCapture'
import GuidedFR from './GuidedFRProcessResults'
import { type ZoomCaptureResult } from './Zoom'
import zoomSdkLoader from './ZoomSdkLoader'

const log = logger.child({ from: 'FaceRecognition' })

declare var ZoomSDK: any

type FaceRecognitionProps = DashboardProps & {}

type State = {
  showZoomCapture: boolean,
  showGuidedFR: boolean,
  sessionId: string | void,
  loadingFaceRecognition: boolean,
  loadingText: string,
  facemap: Blob,
  zoomReady: boolean,
  captureResult: ZoomCaptureResult
}

/**
 * Responsible to orchestrate FaceReco process, using the following modules: ZoomCapture & FRapi.
 * 1. Loads ZoomCapture and recieve ZoomCaptureResult - the user video capture result after processed locally by ZoomSDK (Handled by ZoomCapture)
 * 2. Uses FRapi which is responsible to communicate with GoodServer and UserStorage on FaceRecognition related actions, and handle sucess / failure
 * 3. Display relevant error messages
 * 4. Enables/Disables UI components as dependancy in the state of the process
 **/
class FaceRecognition extends React.Component<FaceRecognitionProps, State> {
  state = {
    showPreText: false,
    showZoomCapture: true,
    showGuidedFR: true,
    sessionId: undefined,
    loadingFaceRecognition: false,
    loadingText: '',
    facemap: new Blob([], { type: 'text/plain' }),
    zoomReady: false,
    fullName: '',
    captureResult: {}
  }

  loadedZoom: any

  timeout: TimeoutID

  containerRef = createRef()

  width = 720

  height = 0

  componentWillUnmount = () => {
    log.debug('Unloading ZoomSDK', this.loadedZoom)
    this.timeout && clearTimeout(this.timeout)
  }

  componentWillMount = async () => {
    await zoomSdkLoader.ready
    this.loadedZoom = ZoomSDK
    this.timeout = setTimeout(() => {
      this.setState({ zoomReady: true })
    }, 0)
  }

  componentDidMount = () => {
    this.setWidth()
  }

  setWidth = () => {
    const containerWidth =
      (this.containerRef && this.containerRef.current && this.containerRef.current.offsetWidth) || this.width
    this.width = Math.min(this.width, containerWidth)
    this.height = window.innerHeight > window.innerWidth ? this.width * 1.77777778 : this.width * 0.5625

    this.width = 720
    this.height = 1280
  }

  onCaptureResult = (captureResult?: ZoomCaptureResult): void => {
    //TODO: rami check uninitilized, return
    log.debug('zoom capture completed', { captureResult })
    this.startFRProcessOnServer(captureResult)
  }

  startFRProcessOnServer = async (captureResult: ZoomCaptureResult) => {
    log.debug('Sending capture result to server', captureResult)
    this.setState({
      showZoomCapture: false,
      showGuidedFR: true,
      sessionId: captureResult.sessionId,
      loadingFaceRecognition: true,
      loadingText: 'Analyzing Face Recognition..'
    })
    let result: FaceRecognitionResponse = await FRapi.performFaceRecognition(captureResult)
    this.setState({ loadingFaceRecognition: false })
    if (!result || !result.ok) {
      // this.showFRError(result.error) // TODO: rami
    } else {
      this.props.screenProps.pop({ isValid: true })
    }
  }

  showFRError = (error: string) => {
    this.setState({ showGuidedFR: false })
    this.props.store.set('currentScreen')({
      dialogData: {
        visible: true,
        title: 'Please try again',
        message: `FaceRecognition failed. Reason: ${error}. Please try again`,
        dismissText: 'Retry',
        onDismiss: this.setState() // reload.
      }
    })
  }

  render() {
    const { showZoomCapture, showGuidedFR, sessionId } = this.state

    return (
      <Wrapper>
        {showGuidedFR && <GuidedFR sessionId={sessionId} userStorage={userStorage} />}

        {showGuidedFR === false && (
          <ZoomCapture
            height={this.height}
            screenProps={this.props.screenProps}
            onCaptureResult={this.onCaptureResult}
            showZoomCapture={this.state.zoomReady && showZoomCapture}
            loadedZoom={this.loadedZoom}
            onError={this.showFRError}
          />
        )}
      </Wrapper>
    )
  }
}

export default SimpleStore.withStore(FaceRecognition)
