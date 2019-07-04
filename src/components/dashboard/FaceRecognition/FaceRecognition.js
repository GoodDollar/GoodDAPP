// @flow
import React, { createRef } from 'react'
import { StyleSheet } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import SimpleStore from '../../../lib/undux/SimpleStore'
import type { DashboardProps } from '../Dashboard'
import logger from '../../../lib/logger/pino-logger'
import { CustomButton, Section, Text, Wrapper } from '../../common'
import userStorage from '../../../lib/gundb/UserStorage'
import FRapi from './FaceRecognitionAPI'
import type FaceRecognitionResponse from './FaceRecognitionAPI'
import ZoomCapture from './ZoomCapture'
import { type ZoomCaptureResult } from './Zoom'
import zoomSdkLoader from './ZoomSdkLoader'

const log = logger.child({ from: 'FaceRecognition' })

declare var ZoomSDK: any

type FaceRecognitionProps = DashboardProps & {}

type State = DashboardState & {
  showPreText: boolean,
  showZoomCapture: boolean,
  loadingFaceRecognition: boolean,
  loadingText: string,
  facemap: Blob,
  zoomReady: boolean,
  intendedAction: string,
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
    facemap: new Blob([], { type: 'text/plain' }),
    zoomReady: false,
    name: '',
    intendedAction: '',
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
    const name = (await userStorage.getProfileFieldDisplayValue('fullName')).split(' ').shift() || 'NoName'
    const intendedAction = this.props.screenProps.screenState.from === 'Claim' ? 'claiming' : 'sending'
    this.setState({ name, intendedAction })

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
    this.setState({ loadingFaceRecognition: false })
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

  showPrivacyPolicy = () => {
    this.props.screenProps.push('PP')
  }

  render() {
    const { intendedAction, name } = this.state
    const { showZoomCapture, showPreText, loadingFaceRecognition, loadingText } = this.state

    return (
      <Wrapper>
        {showPreText ? (
          <Section grow alignItems="center" justifyContent="space-between">
            <Section.Stack grow justifyContent="center" alignItems="center">
              <Text fontSize={24} textAlign="center">{`${name},\nbefore we can get started...`}</Text>
              <Section.Row style={styles.picturePlaceholder} />
              <Section.Row style={styles.privacyPolicyDisclaimer} justifyContent="center" alignItems="center">
                <Text color="primary" textAlign="justify" fontWeight="bold">
                  {`Since it's your first time ${intendedAction} G$, we need to make sure it's really you. Learn more about our `}
                  <Text
                    color="primary"
                    fontWeight="bold"
                    textDecorationLine="underline"
                    onPress={this.showPrivacyPolicy}
                  >
                    privacy policy
                  </Text>
                  .
                </Text>
              </Section.Row>
            </Section.Stack>
            <CustomButton
              mode="contained"
              disabled={this.state.zoomReady === false}
              onPress={this.showFaceRecognition}
              loading={this.state.zoomReady === false || loadingFaceRecognition}
              style={styles.button}
            >
              Quick Face Recognition
            </CustomButton>
          </Section>
        ) : null}
        {loadingFaceRecognition ? (
          <CustomButton mode="contained" loading={true} onPress={() => {}}>
            {loadingText}
          </CustomButton>
        ) : null}

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
  picturePlaceholder: { height: normalize(180) },
  privacyPolicyDisclaimer: {
    width: '80%',
    borderTopWidth: normalize(2),
    borderTopStyle: 'solid',
    borderTopColor: '#00AFFF',
    borderBottomWidth: normalize(2),
    borderBottomStyle: 'solid',
    borderBottomColor: '#00AFFF',
    padding: normalize(12),
    paddingTop: normalize(24),
    paddingBottom: normalize(24)
  },
  button: { width: '100%' }
})

const faceRecognition = SimpleStore.withStore(FaceRecognition)

faceRecognition.navigationOptions = {
  title: 'Face Recognition'
}

export default faceRecognition
