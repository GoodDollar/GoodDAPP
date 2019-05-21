// @flow
import loadjs from 'loadjs'
import React, { useState, useEffect } from 'react'
import Config from '../../../config/config'
import { StyleSheet, View } from 'react-native'
import GDStore from '../../../lib/undux/GDStore'
import logger from '../../../lib/logger/pino-logger'
import { Section } from '../../common'
import { Camera, getResponsiveVideoDimensions } from './Camera.web'
import { initializeAndPreload, capture, type ZoomCaptureResult } from './Zoom'
import type { DashboardProps } from '../Dashboard'

const log = logger.child({ from: 'ZoomCapture' })
//const store = GDStore.useStore()
const [ready, setIsReady] = useState(0)

type ZoomCaptureProps = DashboardProps & {
  screenProps: any,
  store: Store
}

/*
useEffect(() => {
  function handleStatusChange(status) {
    setIsReady(status.ready);
  }*/

class ZoomCapture extends React.Component<ZoomCaptureProps, State> {
  state = {
    ready: false
  }

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
    debugger
    this.props.store.set('captureResult')(captureOutcome)
  }

  render() {
    return (
      <View>
        <Section style={styles.bottomSection}>
          <div id="zoom-parent-container" style={getVideoContainerStyles()}>
            <div id="zoom-interface-container" style={{ position: 'absolute' }} />
            {ready && <Camera height={this.height} onLoad={this.onCameraLoad} />}
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
