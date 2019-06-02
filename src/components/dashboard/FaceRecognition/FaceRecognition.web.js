// @flow
import { FRUtil } from './FRUtil'
import ZoomCapture from './ZoomCapture'
import React, { createRef } from 'react'
import { type ZoomCaptureResult } from './Zoom'
import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import GDStore from '../../../lib/undux/GDStore'
import type { DashboardProps } from '../Dashboard'
import logger from '../../../lib/logger/pino-logger'
import { Wrapper, CustomButton, Section } from '../../common'
import normalize from 'react-native-elements/src/helpers/normalizeText'

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
  zoomReady: boolean,
  captureResult: ZoomCaptureResult
}

class FaceRecognition extends React.Component<FaceRecognitionProps, State> {
  state = {
    showPreText: true,
    showZoomCapture: false,
    loadingFaceRecognition: false,
    loadingText: '',
    facemap: null,
    zoomReady: false,
    captureResult: null
  }

  containerRef = createRef()
  width = 720
  height = 0

  async componentDidMount() {
    this.setWidth()
  }

  onZoomReady() {
    this.setState({ zoomReady: true })
  }

  onCaptureResult(captureResult: ZoomCaptureResult) {
    log.debug('zoom capture completed')
    this.setState({ captureResult: captureResult }, this.startFRProcess(captureResult))
  }

  async startFRProcess(captureResult: ZoomCaptureResult) {
    console.log('capture result changed to:', captureResult)
    this.setState({
      showZoomCapture: false,
      loadingFaceRecognition: true,
      loadingText: 'Analyzing Face Recognition..'
    })
    this.setState({ loadingFaceRecognition: true, loadindText: '' })

    let result: FaceRecognitionResponse = await FRUtil.performFaceRecognition(captureResult)
    this.setState({ loadingFaceRecognition: false, loadindText: '' })
    if (!result || !result.ok) {
      this.showFRError(result.error)
    }
  }

  showFRError(error: string) {
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
    this.setState({ showZoomCapture: true, showPreText: false })
  }

  setWidth = () => {
    const containerWidth =
      (this.containerRef && this.containerRef.current && this.containerRef.current.offsetWidth) || this.width
    this.width = Math.min(this.width, containerWidth)
    this.height = window.innerHeight > window.innerWidth ? this.width * 1.77777778 : this.width * 0.5625

    this.width = 720
    this.height = 1280
  }

  render() {
    const { store }: FaceRecognitionProps = this.props
    const { fullName } = store.get('profile')
    const { showZoomCapture, showPreText, loadingFaceRecognition, loadingText, zoomReady } = this.state

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
            <CustomButton
              mode="contained"
              disabled={zoomReady === false}
              onPress={this.showFaceRecognition}
              loading={loadingFaceRecognition}
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
          <ZoomCapture
            height={this.height}
            screenProps={this.screenProps}
            onZoomReady={this.onZoomReady}
            onCaptureResult={this.onCaptureResult}
          />
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
  }
})

export default GDStore.withStore(FaceRecognition)
