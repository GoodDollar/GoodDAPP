// @flow
import React, { createRef } from 'react'
import { StyleSheet, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import SimpleStore from '../../../lib/undux/SimpleStore'
import type { DashboardProps } from '../Dashboard'
import logger from '../../../lib/logger/pino-logger'
import { CustomButton, Section, Wrapper } from '../../common'
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
  showPreText: boolean,
  showZoomCapture: boolean,
  showGuidedFR: boolean,
  sessionId: string | void,
  loadingFaceRecognition: boolean,
  loadingText: string,
  facemap: Blob,
  zoomReady: boolean,
  fullName: string,
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
    showPreText: true,
    showZoomCapture: false,
    showGuidedFR: false,
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

  componentDidMount = async () => {
    this.setWidth()
    let fullName = (await userStorage.getProfileFieldDisplayValue('fullName')) || ''
    this.setState({ fullName })
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
        onDismiss: this.setState({ showPreText: true }) // reload.
      }
    })
  }

  showFaceRecognition = () => {
    this.setState(prevState => ({ showZoomCapture: true, showPreText: false }))
  }

  render() {
    const {
      showZoomCapture,
      showPreText,
      loadingFaceRecognition,
      loadingText,
      showGuidedFR,
      sessionId,
      fullName
    } = this.state

    return (
      <Wrapper>
        {showPreText && (
          <View style={styles.topContainer}>
            <Section.Title
              style={styles.mainTitle}
            >{`${fullName}, Just one more thing before we can get started...`}</Section.Title>
            <Section.Text style={styles.description}>
              {`Since it's your first time sending G$, we need to make sure it's really
              you and prevent other people from creating multiple accounts.`}
            </Section.Text>
          </View>
        )}
        {showGuidedFR && <GuidedFR sessionId={sessionId} userStorage={userStorage} />}

        {showPreText && (
          <View style={styles.bottomContainer}>
            <CustomButton
              mode="contained"
              disabled={this.state.zoomReady === false}
              onPress={this.showFaceRecognition}
              loading={this.state.zoomReady === false || loadingFaceRecognition}
            >
              Quick Face Recognition
            </CustomButton>
          </View>
        )}
        {loadingFaceRecognition && (
          <CustomButton mode="contained" loading={true} onPress={() => {}}>
            {loadingText}
          </CustomButton>
        )}
        <ZoomCapture
          height={this.height}
          screenProps={this.props.screenProps}
          onCaptureResult={this.onCaptureResult}
          showZoomCapture={showZoomCapture}
          loadedZoom={this.loadedZoom}
          onError={this.showFRError}
        />
      </Wrapper>
    )
  }
}

const styles = StyleSheet.create({
  topContainer: {
    display: 'flex',
    flex: 1,
    justifyContent: 'space-evenly',
    paddingTop: normalize(30)
  },
  bottomContainer: {
    display: 'flex',
    flex: 1,
    paddingTop: normalize(20),
    justifyContent: 'flex-end'
  },
  description: {
    fontSize: normalize(20)
  }
})

export default SimpleStore.withStore(FaceRecognition)
