// @flow
import FRapi from './FaceRecognitionAPI'
import ZoomCapture from './ZoomCapture'
import React, { createRef } from 'react'
import { type ZoomCaptureResult } from './Zoom'
import { StyleSheet, View } from 'react-native'
import GDStore from '../../../lib/undux/GDStore'
import type { DashboardProps } from '../Dashboard'
import logger from '../../../lib/logger/pino-logger'
import { Wrapper, CustomButton, Section } from '../../common'
import normalize from 'react-native-elements/src/helpers/normalizeText'

const log = logger.child({ from: 'FaceRecognition' })

type FaceRecognitionProps = DashboardProps & {
  screenProps: any,
  store: Store
}

type State = {
  showPreText: boolean,
  showZoomCapture: boolean,
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
    showPreText: true,
    showZoomCapture: false,
    loadingFaceRecognition: false,
    loadingText: '',
    facemap: null,
    zoomReady: false,
    captureResult: null
  }

  containerRef = createRef()
  width = 720
  height = 0

  async componentDidMount() {
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

  onZoomReady() {
    this.setState({ zoomReady: true })
  }

  onCaptureResult(captureResult: ZoomCaptureResult) {
    log.debug('zoom capture completed')
    this.setState({ captureResult: captureResult }, this.startFRProcessOnServer(captureResult))
  }

  async startFRProcessOnServer(captureResult: ZoomCaptureResult) {
    console.log('Sending capture result to server', captureResult)
    this.setState({
      showZoomCapture: false,
      loadingFaceRecognition: true,
      loadingText: 'Analyzing Face Recognition..'
    })
    this.setState({ loadingFaceRecognition: true, loadindText: '' })

    let result: FaceRecognitionResponse = await FRapi.performFaceRecognition(captureResult)
    this.setState({ loadingFaceRecognition: false, loadindText: '' })
    if (!result || !result.ok) {
      this.showFRError(result.error)
    }
  }

  showFRError(error: string) {
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
    this.setState({ showZoomCapture: true, showPreText: false })
  }

  render() {
    const { store }: FaceRecognitionProps = this.props
    const { fullName } = store.get('profile')
    const { showZoomCapture, showPreText, loadingFaceRecognition, loadingText, zoomReady } = this.state

    return (
      <Wrapper>
        {showPreText && (
          <View style={styles.topContainer}>
            <Section.Title>{`${fullName},\n Just one last thing...`}</Section.Title>
            <Section.Text style={styles.description}>
              {"In order to give you a basic income we need to make sure it's really you"}
            </Section.Text>
          </View>
        )}
        {showPreText && (
          <View style={styles.bottomContainer}>
            <CustomButton
              mode="contained"
              disabled={zoomReady === false}
              onPress={this.showFaceRecognition}
              loading={loadingFaceRecognition}
            >
              Quick Face Recognition
            </CustomButton>
          </View>
        )}
        {loadingFaceRecognition && (
          <CustomButton mode="contained" loading={true}>
            {loadingText}
          </CustomButton>
        )}

        {showZoomCapture && (
          <ZoomCapture
            height={this.height}
            screenProps={this.screenProps}
            onZoomReady={this.onZoomReady}
            onCaptureResult={this.onCaptureResult}
          />
        )}
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

export default GDStore.withStore(FaceRecognition)
