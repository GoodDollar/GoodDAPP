// @flow
import { Dimensions } from 'react-native'
import React, { createRef, useEffect } from 'react'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { isMobile } from 'mobile-device-detect'
import logger from '../../../lib/logger/pino-logger'

const log = logger.child({ from: 'Camera' })

type CameraProps = {
  width: number,
  height: number,
  onCameraLoad: (track: MediaStreamTrack) => Promise<void>,
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
    log.debug('mounting camera', videoPlayerRef)
    if (videoPlayerRef === null) {
      return
    }
    const { width, height } = Dimensions.get('window')
    log.debug({ width, height })

    //prevent landscape
    if (isMobile && width > height) {
      return props.onError('Please make sure your mobile is in portrait mode and try again.')
    }
    awaitGetUserMedia()
    return () => {
      log.debug('Unloading video track?', !!this.videoTrack)
      this.videoTrack && this.videoTrack.stop()
      this.videoTrack = null
    }
  }, [videoPlayerRef])

  const getStream = async (): Promise<MediaStream> => {
    const constraints = acceptableConstraints[currentConstraintIndex]

    try {
      log.debug('getStream', constraints)
      let device = await window.navigator.mediaDevices.getUserMedia(constraints)
      log.debug('getStream success:', device)
      return device
    } catch (e) {
      log.error('getStream failed', constraints)

      currentConstraintIndex++

      if (currentConstraintIndex >= acceptableConstraints.length) {
        let error =
          'Unable to get a video stream. Please ensure you give permission to this website to access your camera, and have a 720p+ camera plugged in'
        log.error(error)
        throw new Error(error)
      }

      log.warn('Failed getting stream', constraints, e)

      return getStream()
    }
  }

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

      if (!videoPlayerRef || !videoPlayerRef.current) {
        let error = 'No video player found'
        throw new Error(error)
      }
      const videoTrack = stream.getVideoTracks()[0]
      this.videoTrack = videoTrack
      videoPlayerRef.current.srcObject = stream

      videoPlayerRef.current.addEventListener('loadeddata', () => {
        props.onCameraLoad(videoTrack)
      })
    } catch (error) {
      log.error(error)
      props.onError(error)
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

export const getResponsiveVideoDimensionsOld = () => {
  const { width, height } = Dimensions.get('window')

  const defaultHeight = height - 124 > 360 && width < 690
  return {
    height: defaultHeight ? normalize(360) : 'auto',
    maxHeight: defaultHeight ? normalize(360) : height - 124,
    width: defaultHeight ? 'auto' : '100%'
  }
}

export const getResponsiveVideoDimensions = () => {
  const { width, height } = Dimensions.get('window')

  //our max width is 475 and we have (10+5)*2 padding
  const containerWidth = Math.min(475, width) - 30
  const containerHeight = height * 0.666
  if (height > containerWidth) {
    return {
      width: 'auto',
      height: containerHeight
    }
  }
  return {
    width: containerWidth,
    height: 'auto'
  }
}
