// @flow
import logger from '../../lib/logger/pino-logger'
import React, { Component, createRef } from 'react'

const log = logger.child({ from: 'Camera' })

type Props = {
  width: number,
  height: number,
  onLoad: (track: MediaStreamTrack) => void
}

type State = {
  error?: Error
}

export class Camera extends Component<Props, State> {
  state: State = {}

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
        throw new Error(
          'Unable to get a video stream. Please ensure you give permission to this website to access your camera, and have a 720p+ camera plugged in.'
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
    return (
      <>
        {this.state.error && (
          <p>
            <strong>Error:</strong> {this.state.error.message}
          </p>
        )}

        <video
          id="zoom-video-element"
          autoPlay
          playsInline
          ref={this.videoPlayerRef}
          style={{
            width: `${this.props.width}px`,
            height: `${this.props.height}px`
          }}
        />
      </>
    )
  }
}
