// @flow

import React, { createRef } from 'react'
import { StyleSheet, View } from 'react-native'
import GDStore from '../../../lib/undux/GDStore'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { Wrapper, CustomButton, Section } from '../../common'
import ZoomCapture from './ZoomCapture'
import { getResponsiveVideoDimensions } from './Camera.web'
import FRUtil from './FaceRecognitionUtil'
import type { DashboardProps } from '../Dashboard'

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

  async componentDidMount() {
    this.setWidth()
    this.props.store.on('captureResult').subscribe(captureResult => {
      console.log('capture result changed to:', captureResult)
      FRUtil.performFaceRecognition(captureResult)
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
                <ZoomCapture height={this.height} screenProps={this.screenProps} />
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
