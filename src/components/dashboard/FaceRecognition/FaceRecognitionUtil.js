// @flow
import API from '../../../lib/API/api'
import { type ZoomCaptureResult } from './Zoom'
import logger from '../../../lib/logger/pino-logger'
import goodWallet from '../../../lib/wallet/GoodWallet'
import userStorage from '../../../lib/gundb/UserStorage'

type FaceRecognitionResponse = {
  ok: boolean,
  livenessPassed?: boolean,
  isDuplicate?: boolean,
  enrollResult?: object | false
}

const log = logger.child({ from: 'FaceRecognition' })

export const FaceRecognitionUtil = {
  async performFaceRecognition(captureResult: ZoomCaptureResult) {
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
  },

  async createFaceRecognitionReq(captureResult: ZoomCaptureResult) {
    let req = new FormData()
    req.append('sessionId', captureResult.sessionId)
    req.append('facemap', captureResult.facemap, { contentType: 'application/zip' })
    req.append('auditTrailImage', captureResult.auditTrailImage, { contentType: 'image/jpeg' })
    let account = await goodWallet.getAccountForType('zoomId')
    req.append('enrollmentIdentifier', account)
    log.debug({ req })
    return req
  },

  onFaceRecognitionResponse(result: FaceRecognitionResponse) {
    if (!result) {
      log.error('Bad response') // TODO: handle corrupted response
      return
    }
    log.info({ result })
    if (!result.ok || result.livenessPassed === false || result.isDuplicate === true || result.enrollResult === false)
      this.onFaceRecognitionFailure(result)
    if (result.ok && result.enrollResult) this.onFaceRecognitionSuccess(result)
    else log.error('uknown error') // TODO: handle general error
  },

  async onFaceRecognitionSuccess(res: FaceRecognitionResponse) {
    log.info('user passed Face Recognition successfully, res:')
    log.debug({ res })
    this.setState({ loadingFaceRecognition: true, loadingText: 'Saving Face Information to Your profile..' })
    try {
      await userStorage.setProfileField('zoomEnrollmentId', res.enrollResult.enrollmentIdentifier, 'private')
      this.setState({ loadingFaceRecognition: false, loadingText: '' })
    } catch (e) {
      log.error('failed to save facemap') // TODO: handle what happens if the facemap was not saved successfully to the user storage
      this.setState({ loadingFaceRecognition: false, loadingText: '' })
    }
  },

  onFaceRecognitionFailure(result: FaceRecognitionResponse) {
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
}

export default FaceRecognitionUtil
