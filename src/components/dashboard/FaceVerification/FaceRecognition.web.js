// @flow
import React, { createRef } from 'react'
import { get } from 'lodash'
import type { DashboardProps } from '../Dashboard'
import logger from '../../../lib/logger/pino-logger'
import { Wrapper } from '../../common'
import userStorage from '../../../lib/gundb/UserStorage'
import { fireEvent } from '../../../lib/analytics/analytics'
import FRapi from './FaceRecognitionAPI'
import type FaceRecognitionResponse from './FaceRecognitionAPI'
import GuidedFR from './GuidedFRProcessResults'
import ZoomCapture from './ZoomCapture'
import { type ZoomCaptureResult } from './Zoom'
import zoomSdkLoader from './ZoomSdkLoader'

const log = logger.child({ from: 'FaceRecognition' })

declare var ZoomSDK: any

type FaceRecognitionProps = DashboardProps & {}

type State = {
  showZoomCapture: boolean,
  showGuidedFR: boolean,
  sessionId: string | void,
  loadingText: string,
  facemap: Blob,
  zoomReady: boolean,
  captureResult: ZoomCaptureResult,
  isWhitelisted: boolean | void,
  showHelper: boolean,
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
    showGuidedFR: false,
    sessionId: undefined,
    loadingText: '',
    facemap: new Blob([], { type: 'text/plain' }),
    zoomReady: false,
    captureResult: {},
    isWhitelisted: undefined,
    showHelper: get(this.props, 'screenProps.screenState.showHelper', true),
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

    navigator.getMedia =
      navigator.getUserMedia || // use the proper vendor prefix
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia

    navigator.getMedia(
      { video: true },
      () =>
        (this.timeout = setTimeout(() => {
          this.setState({ zoomReady: true })
        }, 0)),
      this.showFRError
    )
  }

  componentDidMount = () => {}

  /**
   *  unused
   */
  setWidth = () => {
    const containerWidth =
      (this.containerRef && this.containerRef.current && this.containerRef.current.offsetWidth) || 300
    this.width = Math.min(this.width, containerWidth)
    this.height = window.innerHeight > window.innerWidth ? this.width * 1.77777778 : this.width * 0.5625
    log.debug({ containerWidth, width: this.width, height: this.height })
  }

  onCaptureResult = (captureResult?: ZoomCaptureResult): void => {
    //TODO: rami check uninitilized, return
    log.debug('zoom capture completed', { captureResult })
    fireEvent('FR_Capture')
    if (captureResult === undefined) {
      log.error('Capture Result failed', 'empty capture result', null, { captureResult })
      this.showFRError('empty capture result')
    } else {
      this.startFRProcessOnServer(captureResult)
    }
  }

  startFRProcessOnServer = async (captureResult: ZoomCaptureResult) => {
    try {
      log.debug('Sending capture result to server', captureResult)
      this.setState({
        showZoomCapture: false,
        showGuidedFR: true,
        sessionId: captureResult.sessionId,
      })
      let result: FaceRecognitionResponse = await FRapi.performFaceRecognition(captureResult)
      log.debug('FR API:', { result })
      if (!result || !result.ok) {
        log.warn('FR API call failed:', { result })
        this.showFRError(result.error) // TODO: rami
      }

      //else if (get(result, 'enrollResult.enrollmentIdentifier', undefined)) {
      //   this.setState({ ...this.state, isAPISuccess: true })
      // } else {
      //   this.setState({ ...this.state, isAPISuccess: false })
      // }
    } catch (e) {
      log.error('FR API call failed:', e.message, e)
      this.showFRError(e.message)
    }
  }

  showFRError = (error: string | Error) => {
    fireEvent('FR_Error')
    this.setState({ showZoomCapture: false, showGuidedFR: false, sessionId: undefined }, () => {
      this.props.screenProps.navigateTo('FRError', { error })
    })
  }

  retry = () => {
    fireEvent('FR_Retry')
    this.setState({
      showGuidedFR: false,
      sessionId: undefined,
      showZoomCapture: true,
      isAPISuccess: undefined,
      showHelper: true,
    })
  }

  done = () => {
    fireEvent('FR_Success')
    this.props.screenProps.pop({ isValid: true })
  }

  render() {
    const { showZoomCapture, showGuidedFR, sessionId, isAPISuccess } = this.state
    return (
      <Wrapper>
        {showGuidedFR && (
          <GuidedFR
            sessionId={sessionId}
            userStorage={userStorage}
            retry={this.retry}
            done={this.done}
            navigation={this.props.screenProps}
            isAPISuccess={isAPISuccess}
          />
        )}

        {this.state.zoomReady && showZoomCapture && (
          <ZoomCapture
            screenProps={this.props.screenProps}
            onCaptureResult={this.onCaptureResult}
            showZoomCapture={this.state.zoomReady && showZoomCapture}
            loadedZoom={this.loadedZoom}
            onError={this.showFRError}
            showHelper={this.state.showHelper}
          />
        )}
      </Wrapper>
    )
  }
}

FaceRecognition.navigationOptions = {
  title: 'Face Verification',
  navigationBarHidden: false,
}
export default FaceRecognition
