// @flow

import loadjs from 'loadjs'
import API from '../../../lib/API/api'
import React, { createRef } from 'react'
import Config from '../../../config/config'
import { StyleSheet, View } from 'react-native'
import GDStore from '../../../lib/undux/GDStore'
import { normalize } from 'react-native-elements'
import logger from '../../../lib/logger/pino-logger'
import userStorage from '../../../lib/gundb/UserStorage'
import { Wrapper, CustomButton, Section } from '../../common'
import { Camera, getResponsiveVideoDimensions } from './Camera.web'
import { initializeAndPreload, capture, type ZoomCaptureResult } from './Zoom'
import goodWallet from '../../../lib/wallet/GoodWallet'
import type { DashboardProps } from '../Dashboard'

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
  ready: boolean
}

type faceRecognitionResponse = {
  ok: boolean,
  livenessPassed: boolean,
  duplicates: boolean
}

class FaceRecognition extends React.Component<FaceRecognitionProps, State> {
  state = {
    showPreText: true,
    showZoomCapture: false,
    loadingFaceRecognition: false,
    loadingText: '',
    facemap: undefined,
    ready: false
  }

  containerRef = createRef()
  width = 720
  height = 0

  async componentDidMount() {
    try {
      await this.loadZoomSDK()
      // eslint-disable-next-line no-undef
      let loadedZoom = ZoomSDK
      log.info('ZoomSDK loaded', loadedZoom)
      await initializeAndPreload(loadedZoom) // TODO: what  to do in case of init errors?
      log.info('ZoomSDK initialized and preloaded', loadedZoom)
      this.setState({ ready: true })
    } catch (e) {
      log.error(e)
    }
    this.setWidth()
  }

  showFaceRecognition = () => {
    this.setState({ showZoomCapture: true, showPreText: false })
  }

  loadZoomSDK = async (): Promise<void> => {
    global.exports = {} // required by zoomSDK
    const server = Config.serverUrl
    log.info({ server })
    const zoomSDKPath = '/ZoomAuthentication.js/ZoomAuthentication.js'
    log.info(`loading ZoomSDK from ${zoomSDKPath}`)
    return loadjs(zoomSDKPath, { returnPromise: true })
  }

  onCameraLoad = async (track: MediaStreamTrack) => {
    let captureOutcome: ZoomCaptureResult
    try {
      captureOutcome = await capture(track) // TODO: handle capture errors.
    } catch (e) {
      log.error(`Failed on capture, error: ${e}`)
    }
    log.info({ captureOutcome })
    await this.performFaceRecognition(captureOutcome)
  }

  setWidth = () => {
    const containerWidth =
      (this.containerRef && this.containerRef.current && this.containerRef.current.offsetWidth) || this.width
    this.width = Math.min(this.width, containerWidth)
    this.height = window.innerHeight > window.innerWidth ? this.width * 1.77777778 : this.width * 0.5625

    this.width = 720
    this.height = 1280
  }

  performFaceRecognition = async (captureResult: ZoomCaptureResult) => {
    log.info({ captureResult })
    this.setState({ showZoomCapture: false, loadingFaceRecognition: true, loadingText: 'Analyzing Face Recognition..' })
    let req = await this.createFaceRecognitionReq(captureResult)
    log.debug({ req })
    this.setState({ facemap: captureResult.facemap })
    try {
      let res = await API.performFaceRecognition(req)
      this.setState({ loadingFaceRecognition: false, loadindText: '' })
      this.onFaceRecognitionResponse(res)
    } catch (e) {
      log.warn('General Error in FaceRecognition', e)
      this.setState({ loadingFaceRecognition: false, loadingText: '' })
    }
  }

  createFaceRecognitionReq = async (captureResult: ZoomCaptureResult) => {
    let req = new FormData()
    req.append('sessionId', captureResult.sessionId)
    req.append('facemap', captureResult.facemap, { contentType: 'application/zip' })
    req.append('auditTrailImage', captureResult.auditTrailImage, { contentType: 'image/jpeg' })
    let account = await goodWallet.getAccountForType('zoomId')
    req.append('enrollmentIdentifier', account)
    log.debug({ req })
    return req
  }

  onFaceRecognitionResponse = (res: faceRecognitionResponse) => {
    if (!res || !res.data) {
      log.error('Bad response') // TODO: handle corrupted response
      return
    }
    let result = res.data
    if (result.ok && result.livenessPassed && !result.duplicates) this.onFaceRecognitionSuccess(result)
    else if (result.ok && (!result.livenessPassed || result.duplicates)) this.onFaceRecognitionFailure(result)
    else log.error('general error') // TODO: handle general error
  }

  onFaceRecognitionSuccess = async res => {
    log.info('user passed Face Recognition successfully, res:')
    log.trace({ res })
    this.setState({ loadingFaceRecognition: true, loadingText: 'Saving Face Information to Your profile..' })
    try {
      await userStorage.setProfileField('zoomEnrollmentId', res.zoomEnrollmentId, 'private')
      this.setState({ loadingFaceRecognition: false, loadingText: '' })
    } catch (e) {
      log.error('failed to save facemap') // TODO: handle what happens if the facemap was not saved successfully to the user storage
      this.setState({ loadingFaceRecognition: false, loadingText: '' })
    }
  }

  onFaceRecognitionFailure = result => {
    log.warn('user did not pass Face Recognition')
    let reason = result.livenessPassed ? '| liveness failed' : ''
    reason += result.duplicates ? '| found duplicated' : ''
    this.props.store.set('currentScreen')({
      dialogData: {
        visible: true,
        title: 'Please try again',
        message: `Face Recognition failed. Reason: ${reason} Please try again`,
        dismissText: 'Retry',
        onDismiss: this.setState({ showPreText: true }) // reload.
      },
      loading: true
    })
  }

  render() {
    const { store }: FaceRecognitionProps = this.props
    const { fullName } = store.get('profile')
    const { showZoomCapture, showPreText, loadingFaceRecognition, loadingText } = this.state

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
              onPress={this.showFaceRecognition}
              loading={this.props.store.get('currentScreen').loading}
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
          <View>
            <Section style={styles.bottomSection}>
              <div id="zoom-parent-container" style={getVideoContainerStyles()}>
                <div id="zoom-interface-container" style={{ position: 'absolute' }} />
                {this.state.ready && <Camera height={this.height} onLoad={this.onCameraLoad} />}
              </div>
            </Section>
          </View>
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
  },
  bottomSection: {
    flex: 1,
    backgroundColor: '#fff'
  }
})

const getVideoContainerStyles = () => ({
  ...getResponsiveVideoDimensions(),
  marginLeft: 'auto',
  marginRight: 'auto',
  marginTop: 0,
  marginBottom: 0
})

export default GDStore.withStore(FaceRecognition)
