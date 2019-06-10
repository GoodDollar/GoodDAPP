// @flow

import loadjs from 'loadjs'
import API from '../../../lib/API/api'
import React, { createRef } from 'react'
import Config from '../../../config/config'
import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import GDStore from '../../../lib/undux/GDStore'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import logger from '../../../lib/logger/pino-logger'
import userStorage from '../../../lib/gundb/UserStorage'
import { Wrapper, CustomButton, Section } from '../../common'
import { fontStyle } from '../../common/styles'
import { Camera, getResponsiveVideoDimensions } from './Camera.web'
import { initializeAndPreload, capture, type ZoomCaptureResult } from './Zoom'
import goodWallet from '../../../lib/wallet/GoodWallet'
import { LinkButton } from '../../signup/components'
import type { DashboardProps } from '../Dashboard'

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
  ready: boolean
}

type FaceRecognitionResponse = {
  ok: boolean,
  livenessPassed?: boolean,
  isDuplicate?: boolean,
  enrollResult?: object | false
}

class FaceRecognition extends React.Component<FaceRecognitionProps, State> {
  state = {
    showPreText: true,
    showZoomCapture: false,
    loadingFaceRecognition: false,
    loadingText: '',
    facemap: null,
    ready: false
  }

  containerRef = createRef()
  width = 720
  height = 0

  async componentWillMount() {
    try {
      await this.loadZoomSDK()
      // eslint-disable-next-line no-undef
      let loadedZoom = ZoomSDK
      log.info('ZoomSDK loaded', loadedZoom)
      loadedZoom.zoomResourceDirectory('/ZoomAuthentication.js/resources')
      await initializeAndPreload(loadedZoom) // TODO: what  to do in case of init errors?
      log.info('ZoomSDK initialized and preloaded', loadedZoom)
      this.timeout = setTimeout(() => {
        this.setState({ ready: true })
      }, 500)
    } catch (e) {
      log.error('initializing failed', e)
    }
    this.setWidth()
  }

  showFaceRecognition = () => {
    this.setState({ showZoomCapture: true, showPreText: false })
  }

  componentWillUnmount() {
    log.debug('Unloading ZoomSDK', ZoomSDK)
    this.timeout && clearTimeout(this.timeout)
    this.videoTrack && this.videoTrack.stop()
    ZoomSDK &&
      ZoomSDK.unload(() => {
        window.ZoomSDK = null
        exports.ZoomSDK = null
        ZoomSDK = null
        log.debug('ZoomSDK unloaded')
      })
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
    this.videoTrack = track
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
    if (!captureResult) return this.onFaceRecognitionFailure({ error: 'Failed to cature user' })
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
    let account = goodWallet.getAccountForType('zoomId')
    req.append('enrollmentIdentifier', account)
    log.debug({ req })
    return req
  }

  onFaceRecognitionResponse = (result: FaceRecognitionResponse) => {
    log.info({ result })
    if (
      !result ||
      !result.ok ||
      result.livenessPassed === false ||
      result.isDuplicate === true ||
      result.enrollResult === false ||
      result.enrollResult.ok === 0
    )
      return this.onFaceRecognitionFailure(result)
    else if (result.ok && result.enrollResult) return this.onFaceRecognitionSuccess(result)
    else {
      log.error('uknown error', { result }) // TODO: handle general error
      this.onFaceRecognitionFailure(result)
    }
  }

  onFaceRecognitionSuccess = async (res: FaceRecognitionResponse) => {
    log.info('user passed Face Recognition successfully, res:')
    log.debug({ res })
    this.setState({ loadingFaceRecognition: true, loadingText: 'Saving Face Information to Your profile..' })
    try {
      if (res.enrollResult.enrollmentIdentifier)
        await userStorage.setProfileField('zoomEnrollmentId', res.enrollResult.enrollmentIdentifier, 'private')
      this.props.screenProps.pop({ isValid: true })
    } catch (e) {
      log.error('failed to save facemap', e) // TODO: handle what happens if the facemap was not saved successfully to the user storage
      this.props.screenProps.pop({ isValid: false })
    }
  }

  onFaceRecognitionFailure = (result: FaceRecognitionResponse & { error: string }) => {
    this.setState({ loadingFaceRecognition: false, loadingText: '', showZoomCapture: false })
    log.warn('user did not pass Face Recognition', result)
    let reason = ''
    if (!result) reason = 'General Error'
    else if (result.error) reason = result.error
    else if (result.livenessPassed === false) reason = 'Liveness Failed'
    else if (result.isDuplicate) reason = 'Face Already Exist'
    else reason = 'Enrollment Failed'

    this.props.store.set('currentScreen')({
      dialogData: {
        visible: true,
        title: 'Please try again',
        message: `FaceRecognition failed. Reason: ${reason}. Please try again`,
        dismissText: 'Retry',
        onDismiss: this.setState({ showPreText: true }) // reload.
      }
    })
  }

  handleNavigateTermsOfUse = () => this.props.screenProps.push('TermsOfUse')
  handleNavigatePrivacyPolicy = () => this.props.screenProps.push('PrivacyPolicy')

  render() {
    const { store }: FaceRecognitionProps = this.props
    const { fullName } = store.get('profile')
    const { showZoomCapture, showPreText, loadingFaceRecognition, loadingText, ready } = this.state

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
            <Text style={styles.acceptTermsText}>
              {`By clicking the 'Create a wallet' button, you are accepting our `}
              <LinkButton style={styles.acceptTermsLink} onPress={this.handleNavigateTermsOfUse}>
                Terms of Service
              </LinkButton>
              {` and `}
              <LinkButton style={styles.acceptTermsLink} onPress={this.handleNavigatePrivacyPolicy}>
                Privacy Policy
              </LinkButton>
            </Text>
            <CustomButton
              mode="contained"
              disabled={ready === false}
              onPress={this.showFaceRecognition}
              loading={ready === false || loadingFaceRecognition}
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

        {ready && showZoomCapture && (
          <View>
            <Section style={styles.bottomSection}>
              <div id="zoom-parent-container" style={getVideoContainerStyles()}>
                <div id="zoom-interface-container" style={{ position: 'absolute' }} />
                <Camera height={this.height} onLoad={this.onCameraLoad} onError={this.onFaceRecognitionFailure} />
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
    fontSize: normalize(18)
  },
  bottomSection: {
    flex: 1,
    backgroundColor: '#fff'
  },
  acceptTermsText: {
    ...fontStyle,
    fontSize: normalize(14),
    marginBottom: '1rem'
  },
  acceptTermsLink: {
    ...fontStyle,
    fontSize: normalize(14),
    fontWeight: 'bold'
  },
  mainTitle: {
    fontSize: normalize(24),
    fontWeight: '500',
    marginBottom: '1rem',
    color: '#555',
    textAlign: 'center'
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
