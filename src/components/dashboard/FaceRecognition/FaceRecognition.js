// @flow
import React, { createRef } from 'react'
import { StyleSheet, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import GDStore from '../../../lib/undux/GDStore'
import type { DashboardProps } from '../Dashboard'
import logger from '../../../lib/logger/pino-logger'
import { CustomButton, Section, Wrapper } from '../../common'
import FRapi from './FaceRecognitionAPI'
import ZoomCapture from './ZoomCapture'
import { type ZoomCaptureResult } from './Zoom'

const log = logger.child({ from: 'FaceRecognition' })

declare var ZoomSDK: any

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

  componentWillUnmount = () => {
    log.debug('Unloading ZoomSDK', this.loadedZoom)
    this.timeout && clearTimeout(this.timeout)
  }

  componentWillMount = async () => {
    this.loadedZoom = ZoomSDK
    if (this.loadedZoom) {
      this.timeout = setTimeout(() => {
        this.zoomReady = true // TODO: handle zoom init issues.
      }, 0)
    }
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

  onCaptureResult = (captureResult: ZoomCaptureResult) => {
    log.debug('zoom capture completed', { captureResult })
    this.startFRProcessOnServer(captureResult)
  }

  startFRProcessOnServer = async (captureResult: ZoomCaptureResult) => {
    log.debug('Sending capture result to server', captureResult)
    this.setState({
      showZoomCapture: false,
      loadingFaceRecognition: true,
      loadingText: 'Analyzing Face Recognition..'
    })
    let result: FaceRecognitionResponse = await FRapi.performFaceRecognition(captureResult)
    this.setState({ loadingFaceRecognition: false, loadindText: '' })
    if (!result || !result.ok) {
      this.showFRError(result.error)
    } else {
      this.props.screenProps.pop({ isValid: true })
    }
  }

  showFRError = (error: string) => {
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
    const { store }: FaceRecognitionProps = this.props
    const { fullName } = store.get('profile')
    const { showZoomCapture, showPreText, loadingFaceRecognition, loadingText } = this.state

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
        {showPreText && (
          <View style={styles.bottomContainer}>
            <CustomButton
              mode="contained"
              disabled={this.zoomReady === false}
              onPress={this.showFaceRecognition}
              loading={this.zoomReady === false || loadingFaceRecognition}
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

        <ZoomCapture
          height={this.height}
          screenProps={this.screenProps}
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

export default GDStore.withStore(FaceRecognition)
