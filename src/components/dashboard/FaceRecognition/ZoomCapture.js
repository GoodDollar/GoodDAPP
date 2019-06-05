// @flow
import React from 'react'
import { Section } from '../../common'
import { StyleSheet, View } from 'react-native'
import GDStore from '../../../lib/undux/GDStore'
import type { DashboardProps } from '../Dashboard'
import logger from '../../../lib/logger/pino-logger'
import { Camera, getResponsiveVideoDimensions } from './Camera.web'
import { capture, type ZoomCaptureResult } from './Zoom'

const log = logger.child({ from: 'ZoomCapture' })

type ZoomCaptureProps = DashboardProps & {
  screenProps: any,
  store: Store
}

/**
 * Responsible for Zoom client SDK triggering:
 * 1. Calls zoom.capture() on the camera capture (Recieved from Camera component)
 * 2. Triggers callback when captureResult is ready
 */
class ZoomCapture extends React.Component<ZoomCaptureProps, State> {
  onCameraLoad = async (track: MediaStreamTrack) => {
    this.videoTrack = track
    let captureOutcome: ZoomCaptureResult
    try {
      log.debug('zoom performs capture..')
      let zoomSDK = this.props.loadedZoom
      captureOutcome = await capture(zoomSDK, track) // TODO: handle capture errors.
    } catch (e) {
      log.error(`Failed on capture, error: ${e}`)
    }
    log.info({ captureOutcome })
    this.props.onCaptureResult(captureOutcome)
  }

  componentWillUnmount() {
    log.debug('Unloading video track?', !!this.videoTrack)
    this.videoTrack && this.videoTrack.stop()
  }

  componentDidMount() {
    if (!this.props.loadedZoom) log.warn('zoomSDK was not loaded into ZoomCapture properly')
  }
  render() {
    const showZoomCapture = this.props.showZoomCapture
    return (
      showZoomCapture && (
        <View>
          <Section style={styles.bottomSection}>
            <div id="zoom-parent-container" style={getVideoContainerStyles()}>
              <div id="zoom-interface-container" style={{ position: 'absolute' }} />
              {<Camera height={this.height} onLoad={this.onCameraLoad} onError={this.props.onError} />}
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
