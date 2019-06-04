// @flow
import React from 'react'
import loadjs from 'loadjs'
import { Section } from '../../common'
import Config from '../../../config/config'
import { StyleSheet, View } from 'react-native'
import GDStore from '../../../lib/undux/GDStore'
import type { DashboardProps } from '../Dashboard'
import logger from '../../../lib/logger/pino-logger'
import { Camera, getResponsiveVideoDimensions } from './Camera.web'
import { initializeAndPreload, capture, type ZoomCaptureResult } from './Zoom'

const log = logger.child({ from: 'ZoomCapture' })

type ZoomCaptureProps = DashboardProps & {
  screenProps: any,
  store: Store
}

type State = {
  ready: boolean
}
/**
 * Responsible for Zoom client SDK loading and triggering:
 * 1. Loads ZoomSDK
 * 2. Calls zoom.capture() on the camera capture (Recieved from Camera component)
 * 3. Triggers callback when captureResult is ready
 */
class ZoomCapture extends React.Component<ZoomCaptureProps, State> {
  state = {
    ready: false
  }

  async componentWillMount() {
    try {
      await this.loadZoomSDK()
      // eslint-disable-next-line no-undef
      let loadedZoom = ZoomSDK
      log.info('ZoomSDK loaded', loadedZoom)
      loadedZoom.zoomResourceDirectory('/ZoomAuthentication.js/resources')
      await initializeAndPreload(loadedZoom) // TODO: what  to do in case of init errors?
      log.info('ZoomSDK initialized and preloaded', loadedZoom)
      this.setState({ ready: true }, this.props.onZoomReady()) // notify parent to enable 'Face Recognition' button
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
    this.props.onCaptureResult(captureOutcome)
  }

  render() {
    const ready = this.state.ready
    return (
      ready && (
        <View>
          <Section style={styles.bottomSection}>
            <div id="zoom-parent-container" style={getVideoContainerStyles()}>
              <div id="zoom-interface-container" style={{ position: 'absolute' }} />
              {<Camera height={this.height} onLoad={this.onCameraLoad} />}
            </div>
          </Section>
        </View>
      )
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
