// @flow
import React, { Component, createRef } from 'react'
import { Text, Dimensions } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'

import { getScreenHeight, getScreenWidth, isPortrait } from '../../../lib/utils/Orientation'

type CameraProps = {
  onLoad: (track: MediaStreamTrack) => Promise,
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
      if (this.videoPlayerRef.current) {
        this.videoPlayerRef.current.srcObject = stream

        this.videoPlayerRef.current.addEventListener('loadeddata', () => {
          this.props.onLoad(videoTrack)
        })
      }
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

// const screenSizes: Array<Array<number>> = [[360, 640], [720, 1280], [1080, 1920]]

// const getScreenSizes = (size1: number, size2: number): Array<number> => {
//   const index = size1 >= 1080 && size2 >= 1920 ? 2 : size1 >= 720 && size2 >= 1280 ? 1 : 0
//   return screenSizes[index]
// }

// export const getResponsiveVideoDimensions = () => {
//   if (isPortrait()) {
//     const [width, height] = getScreenSizes(getScreenWidth(), getScreenHeight() - 124)
//     return {
//       height,
//       maxHeight: height,
//       width
//     }
//   } else {
//     const [height, width] = getScreenSizes(getScreenHeight() - 124, getScreenWidth())
//     return {
//       height,
//       maxHeight: height,
//       width
//     }
//   }
// }

const createStyles = () => {
  return {
    videoElement: {
      // ...getResponsiveVideoDimensions(),
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
