// @flow
import React from 'react'
import get from 'lodash/get'
import { v4 as uuidv4 } from 'uuid'
import { FaceCapture } from '@gooddollar/react-native-web-facecapture' // eslint-disable-line
import type { DashboardProps } from '../Dashboard'
import logger from '../../../lib/logger/pino-logger'
import { Wrapper } from '../../common'
import userStorage from '../../../lib/gundb/UserStorage'
import { fireEvent } from '../../../lib/analytics/analytics'
import { type FaceRecognitionResponse, performFaceRecognition } from './api'
import GuidedFR from './components/GuidedFRProcessResults'

const log = logger.child({ from: 'FaceRecognition' })

type FaceRecognitionProps = DashboardProps & {}

type State = {
  showZoomCapture: boolean,
  showGuidedFR: boolean,
  sessionId: string | void,
  loadingText: string,
  facemap: Blob,
  zoomReady: boolean,
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
    isWhitelisted: undefined,
    showHelper: get(this.props, 'screenProps.screenState.showHelper', true),
  }

  timeout: TimeoutID

  width = 720

  height = 0

  onCaptureResult = (face, images): void => {
    fireEvent('FR_Capture')
    if (images === undefined || images.length === 0) {
      log.error('Capture Result failed', 'empty capture result', null, { images })
      this.showFRError('empty capture result')
    } else {
      this.startFRProcessOnServer(face)
    }
  }

  async startFRProcessOnServer(images) {
    try {
      log.debug('Sending capture result to server')
      const sessionId = uuidv4()
      this.setState({
        showCamera: false,
        showGuidedFR: true,
        sessionId,
      })
      let result: FaceRecognitionResponse = await performFaceRecognition({ images, sessionId })
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
      showCamera: true,
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
            onFaces={this.onCaptureResult}
            onError={this.showFRError}
            howHelper={this.state.showHelper}
            photos={2} // count of the final face photos to make
            quality={1080} // quality of the final photos
            sampleQuality={480} // quality of the transitional photos made for validate face position/>
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
