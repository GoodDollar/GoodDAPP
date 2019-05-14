// @flow
import loadjs from 'loadjs'
import API from '../../../lib/API/api'
import React from 'react'
import Config from '../../../config/config'
import { StyleSheet, View } from 'react-native'
import GDStore from '../../../lib/undux/GDStore'
import logger from '../../../lib/logger/pino-logger'
import userStorage from '../../../lib/gundb/UserStorage'
import { Section } from '../../common'
import { Camera, getResponsiveVideoDimensions } from './Camera.web'
import { initializeAndPreload, capture, type ZoomCaptureResult } from './Zoom'
import goodWallet from '../../../lib/wallet/GoodWallet'
import type { DashboardProps } from '../Dashboard'

const log = logger.child({ from: 'ZoomCapture' })
//const store = GDStore.useStore()

type ZoomCaptureProps = DashboardProps & {
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

type FaceRecognitionResponse = {
  ok: boolean,
  livenessPassed?: boolean,
  isDuplicate?: boolean,
  enrollResult?: object | false
}

class ZoomCapture extends React.Component<ZoomCaptureProps, State> {
  async componentDidMount() {
    try {
      await this.loadZoomSDK()
      // eslint-disable-next-line no-undef
      let loadedZoom = ZoomSDK
      log.info('ZoomSDK loaded', loadedZoom)
      loadedZoom.zoomResourceDirectory('/ZoomAuthentication.js/resources')
      await initializeAndPreload(loadedZoom) // TODO: what  to do in case of init errors?
      log.info('ZoomSDK initialized and preloaded', loadedZoom)
      this.setState({ ready: true })
    } catch (e) {
      log.error(e)
    }
  }

  loadZoomSDK = async (): Promise<void> => {
    global.exports = {} // required by zoomSDK
    const server = Config.publicUrl
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
    this.props.store.set('captureResult')(captureOutcome)
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
      this.onFaceRecognitionResponse(res.data)
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

  onFaceRecognitionResponse = (result: FaceRecognitionResponse) => {
    if (!result) {
      log.error('Bad response') // TODO: handle corrupted response
      return
    }
    log.info({ result })
    if (!result.ok || result.livenessPassed === false || result.isDuplicate === true || result.enrollResult === false)
      this.onFaceRecognitionFailure(result)
    if (result.ok && result.enrollResult) this.onFaceRecognitionSuccess(result)
    else log.error('uknown error') // TODO: handle general error
  }

  onFaceRecognitionSuccess = async (res: FaceRecognitionResponse) => {
    log.info('user passed Face Recognition successfully, res:')
    log.debug({ res })
    this.setState({ loadingFaceRecognition: true, loadingText: 'Saving Face Information to Your profile..' })
    try {
      if (res.enrollResult.enrollmentIdentifier)
        await userStorage.setProfileField('zoomEnrollmentId', res.enrollResult.enrollmentIdentifier, 'private')
      this.setState({ loadingFaceRecognition: false, loadingText: '' })
    } catch (e) {
      log.error('failed to save facemap') // TODO: handle what happens if the facemap was not saved successfully to the user storage
      this.setState({ loadingFaceRecognition: false, loadingText: '' })
    }
  }

  onFaceRecognitionFailure = (result: FaceRecognitionResponse) => {
    log.warn('user did not pass Face Recognition', result)
    let reason = ''
    if (result.livenessPassed === false) reason = 'Liveness Failed'
    else if (result.isDuplicate) reason = 'Face Already Exist'
    else reason = 'Enrollment Failed'

    this.props.store.set('currentScreen')({
      dialogData: {
        visible: true,
        title: 'Please try again',
        message: `FaceRecognition failed. Reason: ${reason}. Please try again`,
        dismissText: 'Retry',
        onDismiss: this.setState({ showPreText: true }) // reload.
      },
      loading: true
    })
  }

  render() {
    return (
      <View>
        <Section style={styles.bottomSection}>
          <div id="zoom-parent-container" style={getVideoContainerStyles()}>
            <div id="zoom-interface-container" style={{ position: 'absolute' }} />
            {this.state.ready && <Camera height={this.height} onLoad={this.onCameraLoad} />}
          </div>
        </Section>
      </View>
    )
  }
}

const styles = StyleSheet.create({
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

export default GDStore.withStore(ZoomCapture)
