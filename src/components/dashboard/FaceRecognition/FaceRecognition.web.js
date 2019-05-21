// @flow

import React, { createRef } from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import GDStore from '../../../lib/undux/GDStore'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { Wrapper, CustomButton, Section } from '../../common'
import ZoomCapture from './ZoomCapture'
import { getResponsiveVideoDimensions } from './Camera.web'
import FRUtil from './FRUtil'
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
    this.props.store.on('captureResult').subscribe(async captureResult => {
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
    })
  }

  showFRError(error: string) {
    this.props.store.set('currentScreen')({
      dialogData: {
        visible: true,
        title: 'Please try again',
        message: `FaceRecognition failed. Reason: ${error}. Please try again`,
        dismissText: 'Retry',
        onDismiss: this.setState({ showPreText: true }) // reload.
      },
      loading: true
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
            <CustomButton mode="contained" onPress={this.showFaceRecognition} loading={loadingFaceRecognition}>
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
