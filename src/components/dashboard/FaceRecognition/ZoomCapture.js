// @flow
import React from 'react'
import { View } from 'react-native'
import SimpleStore from '../../../lib/undux/SimpleStore'
import logger from '../../../lib/logger/pino-logger'
import { withStyles } from '../../../lib/styles'
import { Camera, getResponsiveVideoDimensions } from './Camera.web'
import Zoom, { type ZoomCaptureResult } from './Zoom'
import HelperWizard from './HelperWizard'

const log = logger.child({ from: 'ZoomCapture' })

// TODO: Rami - what is type compared to class?
//TODO: Rami - should I handle onEror and create a class instead of type?

type ZoomCaptureProps = {
  screenProps: any,
  loadedZoom: boolean,
  onCaptureResult: (captureResult?: ZoomCaptureResult) => void,
  onError: (error: string) => void,
  showHelper: boolean,
}

/**
 * Responsible for Zoom client SDK triggering:
 * 1. Calls zoom.capture() on the camera capture (Recieved from Camera component)
 * 2. Triggers callback when captureResult is ready
 */
class ZoomCapture extends React.Component<ZoomCaptureProps> {
  videoTrack: MediaStreamTrack

  zoom: Zoom

  state = {
    cameraReady: false,
  }

  cameraReady = async (track: MediaStreamTrack) => {
    const { store, loadedZoom, showHelper, onError } = this.props
    log.debug('camera ready')
    this.videoTrack = track
    try {
      log.debug('zoom initializes capture..')
      this.zoom = new Zoom(loadedZoom)
      await this.zoom.ready
      this.setState({ cameraReady: true }, () => store.set('loadingIndicator')({ loading: false }))
      if (showHelper === false) {
        this.captureUserMediaZoom()
      }
    } catch (e) {
      log.error('Failed on capture, error:', e.message, e)
      onError(e)
    }
  }

  captureUserMediaZoom = async () => {
    const { onCaptureResult, onError } = this.props
    let captureOutcome: ZoomCaptureResult
    try {
      log.debug('zoom performs capture..')
      await this.zoom.ready
      captureOutcome = await this.zoom.capture(this.videoTrack) // TODO: handle capture errors.
      log.info({ captureOutcome })
      if (captureOutcome) {
        onCaptureResult(captureOutcome)
      }
    } catch (e) {
      log.error('Failed on capture, error:', e.message, e)
      onError(e)
    }
  }

  componentDidMount() {
    const { store, loadedZoom } = this.props
    store.set('loadingIndicator')({ loading: true })
    if (!loadedZoom) {
      log.warn('zoomSDK was not loaded into ZoomCapture properly')
    }
  }

  componentWillUnmount() {
    const { cameraReady } = this.state
    const { loadedZoom, store } = this.props
    if (cameraReady === false) {
      store.set('loadingIndicator')({ loading: false })
    }
    if (loadedZoom) {
      log.warn('zoomSDK was loaded, canceling zoom capture')
      this.zoom && this.zoom.cancel()
    }
  }

  render() {
    const { styles, showHelper, onError } = this.props
    const { cameraReady } = this.state
    return (
      <View>
        <View style={styles.bottomSection}>
          <div id="zoom-parent-container" style={getVideoContainerStyles()}>
            <View id="helper" style={styles.helper}>
              {cameraReady ? <HelperWizard done={this.captureUserMediaZoom} skip={showHelper === false} /> : null}
            </View>
            <div id="zoom-interface-container" style={zoomInterfaceStyle} />
            {<Camera key="camera" onCameraLoad={this.cameraReady} onError={onError} />}
          </div>
        </View>
      </View>
    )
  }
}

const getStylesFromProps = ({ theme }) => ({
  zoomInterfaceContainer: {
    position: 'absolute',
  },
  bottomSection: {
    flex: 1,
    backgroundColor: theme.colors.white,
    padding: 5,
    borderRadius: 5,
  },
  helper: {
    position: 'absolute',
    top: 0,
    zIndex: 10,
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
})
const zoomInterfaceStyle = {
  position: 'absolute',
}
const getVideoContainerStyles = () => ({
  ...getResponsiveVideoDimensions(),
  marginLeft: '0',
  marginRight: '0',
  marginTop: 0,
  marginBottom: 0,
})

export default SimpleStore.withStore(withStyles(getStylesFromProps)(ZoomCapture))
