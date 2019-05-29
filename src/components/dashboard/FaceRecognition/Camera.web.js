// @flow
import React, { Component, createRef } from 'react'
import { Dimensions, Text } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'

const { width, height } = Dimensions.get('window')

type CameraProps = {
  width: number,
  height: number,
  onLoad: (track: MediaStreamTrack) => void,
  onError: (result: any) => void
}

type CameraState = {
  error?: Error
}

export class Camera extends Component<CameraProps, CameraState> {
  state: CameraState = {}

  videoPlayerRef = createRef<HTMLVideoElement>()

  acceptableConstraints: MediaStreamConstraints[] = [
    {
      audio: false,
      video: {
        width: { exact: 1280 },
        height: { exact: 720 },
        facingMode: 'user'
      }
    },
    {
      audio: false,
      video: {
        width: { exact: 640 },
        height: { exact: 360 },
        facingMode: 'user'
      }
    },
    {
      audio: false,
      video: {
        width: { exact: 1920 },
        height: { exact: 1080 },
        facingMode: 'user'
      }
    }
  ]

  currentConstraintIndex = 0

  async componentDidMount() {
    await this.getUserMedia()
  }

  async getStream(): Promise<MediaStream> {
    const constraints = this.acceptableConstraints[this.currentConstraintIndex]

    try {
      return await window.navigator.mediaDevices.getUserMedia(constraints)
    } catch (e) {
      this.currentConstraintIndex++

      if (this.currentConstraintIndex >= this.acceptableConstraints.length) {
        /* throw new Error(
          `Unable to get a video stream. Please ensure you give permission to this website to access your camera,
          and have a 720p+ camera plugged in.`
        )*/
        this.props.onError({
          error: `Unable to get a video stream. Please ensure you give permission to this website to access your camera,
        and have a 720p+ camera plugged in.`
        })

        throw new Error(
          `Unable to get a video stream. Please ensure you give permission to this website to access your camera,
          and have a 720p+ camera plugged in.`
        )
      }
      return this.getStream()
    }
  }

  async getUserMedia() {
    try {
      const stream = await this.getStream()

      if (!this.videoPlayerRef.current) {
        throw new Error('No video player found')
      }

      const videoTrack = stream.getVideoTracks()[0]

      this.videoPlayerRef.current.srcObject = stream

      this.videoPlayerRef.current.addEventListener('loadeddata', () => {
        this.props.onLoad(videoTrack)
      })
    } catch (error) {
      this.setState({ error })
    }
  }

  render() {
    const styles = createStyles()
    return (
      <>
        {this.state.error && (
          <Text>
            <strong>Error:</strong> {this.state.error.message}
          </Text>
        )}
        <div style={styles.videoContainer}>
          <video id="zoom-video-element" autoPlay playsInline ref={this.videoPlayerRef} style={styles.videoElement} />
        </div>
      </>
    )
  }
}

export const getResponsiveVideoDimensions = () => {
  const defaultHeight = height - 124 > 360 && width < 690
  return {
    height: defaultHeight ? normalize(360) : 'auto',
    maxHeight: defaultHeight ? normalize(360) : height - 124,
    width: defaultHeight ? 'auto' : '100%'
  }
}

const createStyles = () => {
  return {
    videoElement: {
      ...getResponsiveVideoDimensions(),
      /* REQUIRED - handle flipping of ZoOm interface.  users of selfie-style interfaces are trained to see their mirror image */
      transform: 'scaleX(-1)',
      overflow: 'hidden',
      justifySelf: 'center'
    },
    videoContainer: {
      display: 'grid',
      justifyContent: 'center',
      alignContent: 'center',
      overflow: 'hidden'
    }
  }
}
