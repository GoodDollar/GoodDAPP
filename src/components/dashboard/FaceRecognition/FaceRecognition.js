// @flow
import React, { createRef } from 'react'
import get from 'lodash/get'
import { FaceCapture } from '@gooddollar/react-native-web-facecapture'
import type { DashboardProps } from '../Dashboard'
import logger from '../../../lib/logger/pino-logger'
import { Wrapper } from '../../common'
import userStorage from '../../../lib/gundb/UserStorage'
import { fireEvent } from '../../../lib/analytics/analytics'
import FRapi from './FaceRecognitionAPI'
import type FaceRecognitionResponse from './FaceRecognitionAPI'
import GuidedFR from './GuidedFRProcessResults'

const log = logger.child({ from: 'FaceRecognition' })

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
    showCamera: true,
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

  uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    )
  }

  onCaptureResult = (face, camera, images): void => {
    log.debug('capture completed', { face, imageCount: images.length })
    fireEvent('FR_Capture')
    if (images === undefined || images.length === 0) {
      log.error('empty capture result')
      this.showFRError('empty capture result')
    } else {
      this.startFRProcessOnServer(images)
    }
  }

  startFRProcessOnServer = async images => {
    try {
      log.debug('Sending capture result to server')
      const sessionId = this.uuidv4()
      this.setState({
        showCamera: false,
        showGuidedFR: true,
        sessionId,
      })
      let result: FaceRecognitionResponse = await FRapi.performFaceRecognition({ images, sessionId })
      log.debug('FR API:', { result })
      if (!result || !result.ok) {
        log.warn('FR API call failed:', { result })
        this.showFRError(result.error)
      }
    } catch (e) {
      log.error('FR API call failed:', e.message, e)
      this.showFRError(e.message)
    }
  }

  showFRError = (error: string | Error) => {
    log.debug('onError called', { error })
    if (error.code === 'E_TAKE_PICTURE_FAILED') {
      return
    }
    fireEvent('FR_Error')
    this.setState({ showCamera: false, showGuidedFR: false, sessionId: undefined }, () => {
      this.props.screenProps.navigateTo('FRError', { error })
    })
  }

  retry = () => {
    fireEvent('FR_Retry')
    this.setState({
      showGuidedFR: false,
      sessionId: undefined,
      dhowCamera: true,
      isAPISuccess: undefined,
      showHelper: true,
    })
  }

  done = () => {
    fireEvent('FR_Success')
    this.props.screenProps.pop({ isValid: true })
  }

  render() {
    const { showCamera, showGuidedFR, sessionId, isAPISuccess } = this.state
    return (
      <Wrapper style={{ margin: 0, padding: 0 }}>
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

        {showCamera && (
          <FaceCapture
            pictureOptions={{
              width: 1080,
            }}
            debug={true}
            onFaces={this.onCaptureResult}
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
