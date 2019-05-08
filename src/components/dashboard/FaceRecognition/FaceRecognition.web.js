// @flow
import React, { createRef } from 'react'
import loadjs from 'loadjs'
import { StyleSheet, View } from 'react-native'
import API from '../../../lib/API/api'
import GDStore from '../../../lib/undux/GDStore'
import { normalize } from 'react-native-elements'
import logger from '../../../lib/logger/pino-logger'
import { Camera, getResponsiveVideoDimensions } from './Camera.web'
import Config from '../../../config/config'
import { Wrapper, CustomButton, Section } from '../../common'
import { initializeAndPreload, capture, type ZoomCaptureResult } from './Zoom'
import type { DashboardProps } from '../Dashboard'

const log = logger.child({ from: 'FaceRecognition' })

type FaceRecognitionProps = DashboardProps & {
  screenProps: any,
  store: Store
}

type State = {
  showZoomCapture: boolean,
  ready: boolean
}

class FaceRecognition extends React.Component<FaceRecognitionProps, State> {
  state = {
    showZoomCapture: false,
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
    // this.props.screenProps.onCaptureComplete(captureOutcome)
    log.info({ captureOutcome })
    await this.enroll(captureOutcome)
  }

  setWidth = () => {
    const containerWidth =
      (this.containerRef && this.containerRef.current && this.containerRef.current.offsetWidth) || this.width
    this.width = Math.min(this.width, containerWidth)
    this.height = window.innerHeight > window.innerWidth ? this.width * 1.77777778 : this.width * 0.5625

    this.width = 720
    this.height = 1280
  }

  enroll = async (captureResult: ZoomCaptureResult) => {
    log.info({ captureResult })
    try {
      await API.enroll(captureResult)
      this.props.store.set('currentScreen')({
        dialogData: {
          visible: true,
          title: 'Success',
          message: `You've successfully passed face recognition`,
          dismissText: 'YAY!',
          onDismiss: this.props.screenProps.goToRoot
        },
        loading: true
      })
    } catch (e) {
      log.warn('FaceRecognition failed', e)
    }
  }

  render() {
    const { store }: FaceRecognitionProps = this.props
    const { fullName } = store.get('profile')
    const showZoomCapture = this.state.showZoomCapture
    return (
      <Wrapper>
        {!showZoomCapture && (
          <View style={styles.topContainer}>
            <Section.Title>{`${fullName},\n Just one last thing...`}</Section.Title>
            <Section.Text style={styles.description}>
              {"In order to give you a basic income we need to make sure it's really you"}
            </Section.Text>
          </View>
        )}
        {!showZoomCapture && (
          <View style={styles.bottomContainer}>
            <CustomButton
              mode="contained"
              onPress={this.setState({ showZoomCapture: true })}
              loading={this.props.store.get('currentScreen').loading}
            >
              Quick Face Recognition
            </CustomButton>
          </View>
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
