// @flow
import { Dimensions } from 'react-native'
import React, { useEffect, createRef } from 'react'
import logger from '../../../lib/logger/pino-logger'
import normalize from 'react-native-elements/src/helpers/normalizeText'

const log = logger.child({ from: 'Camera' })
const { width, height } = Dimensions.get('window')

type CameraProps = {
  width: number,
  height: number,
  onLoad: (track: MediaStreamTrack) => void,
  onError: (result: string) => void
}

/**
 * Responsible to capture Camera stream
 */
export function Camera(props: CameraProps) {
  let videoPlayerRef = createRef<HTMLVideoElement>()
  let currentConstraintIndex = 0
  const acceptableConstraints: MediaStreamConstraints[] = [
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

  useEffect(() => {
    awaitGetUserMedia()
  }, [])

  const styles = {
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

  const awaitGetUserMedia = async () => {
    await getUserMedia()
  }

  const getUserMedia = async () => {
    try {
      const stream = await getStream()

      if (!videoPlayerRef.current) {
        let error = 'No video player found'
        log.error(error)
        props.onError(error)
        throw new Error(error)
      }

      const videoTrack = stream.getVideoTracks()[0]

      videoPlayerRef.current.srcObject = stream

      videoPlayerRef.current.addEventListener('loadeddata', () => {
        props.onLoad(videoTrack)
      })
    } catch (error) {
      log.error(error)
      props.onError(error)
      throw new Error(error)
    }
  }

  const getStream = async (): Promise<MediaStream> => {
    const constraints = acceptableConstraints[currentConstraintIndex]

    try {
      return await window.navigator.mediaDevices.getUserMedia(constraints)
    } catch (e) {
      currentConstraintIndex++

      if (currentConstraintIndex >= acceptableConstraints.length) {
        let error =
          'Unable to get a video stream. Please ensure you give permission to this website to access your camera, and have a 720p+ camera plugged in'
        log.error(error)
        props.onError(error)
        throw new Error(error)
      }

      log.error('Unknown error in getStream()', e)
      props.onError('General Error')
      return getStream()
    }
  }

  return (
    <>
      <div style={styles.videoContainer}>
        <video id="zoom-video-element" autoPlay playsInline ref={videoPlayerRef} style={styles.videoElement} />
      </div>
    </>
  )
}

export const getResponsiveVideoDimensions = () => {
  const defaultHeight = height - 124 > 360 && width < 690
  return {
    height: defaultHeight ? normalize(360) : 'auto',
    maxHeight: defaultHeight ? normalize(360) : height - 124,
    width: defaultHeight ? 'auto' : '100%'
  }
}
