import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { get } from 'lodash'

import CameraNotAllowedError from '../components/CameraNotAllowedError'
import DeviceOrientationError from '../components/DeviceOrientationError'
import DuplicateFoundError from '../components/DuplicateFoundError'
import GeneralError from '../components/GeneralError'
import UnrecoverableError from '../components/UnrecoverableError'

import GDStore from '../../../../lib/undux/GDStore'
import useVerificationAttempts from '../hooks/useVerificationAttempts'

import { getFirstWord } from '../../../../lib/utils/getFirstWord'

const MAX_RETRIES_ALLOWED = 2

const ErrorScreen = ({ styles, screenProps }) => {
  const store = GDStore.useStore()
  const exception = get(screenProps, 'screenState.error')
  const kindOfTheIssue = get(exception, 'name')
  const isGeneralError = !kindOfTheIssue || !(kindOfTheIssue in ErrorScreen.kindOfTheIssue)

  const { attemptsCount, trackAttempt, resetAttempts, attemptsHistory } = useVerificationAttempts()

  // storing first received attempts count into the ref to avoid component re-updated after attempt tracked
  const verificationAttemptsRef = useRef(attemptsCount)

  const displayTitle = useMemo(() => {
    const { fullName } = store.get('profile')

    return getFirstWord(fullName)
  }, [store])

  const onRetry = useCallback(() => screenProps.navigateTo('FaceVerificationIntro'), [screenProps])

  const ErrorViewComponent = useMemo(() => {
    if (!isGeneralError) {
      return ErrorScreen.kindOfTheIssue[kindOfTheIssue]
    }

    if (verificationAttemptsRef.current >= MAX_RETRIES_ALLOWED) {
      return UnrecoverableError
    }

    return GeneralError

    // isGeneralError depends from kindOfTheIssue so we could omit it in the deps list
  }, [kindOfTheIssue])

  useEffect(() => {
    // tracking attempt here as we should track only "general" error
    // (when "something went wrong on our side")
    // if there will be a Human errors (like DeviceOrientation or Permission errors)
    // it will be skip and do not consider as failed attempt
    if (!isGeneralError && kindOfTheIssue !== 'DuplicateFoundError') {
      return
    }

    // tracking all attempts except the last one
    // after the last FV fail the unrecoverable error screen will be displayed
    if (verificationAttemptsRef.current < MAX_RETRIES_ALLOWED) {
      // track attempt and save its message
      trackAttempt(exception)
      return
    }

    // reset/clear saved attempts count and messages
    resetAttempts()
  }, [])

  // the last failed attempt won't be tracked
  // so concating saved attempt messages with the latest received and pass to unrecoverable component
  const attemptErrMessages = useMemo(() => attemptsHistory.concat([exception]), [attemptsHistory, exception])

  return (
    <ErrorViewComponent
      onRetry={onRetry}
      displayTitle={displayTitle}
      screenProps={screenProps}
      exception={exception}
      attemptErrMessages={attemptErrMessages}
    />
  )
}

ErrorScreen.navigationOptions = {
  title: 'Face Verification',
  navigationBarHidden: false,
}

ErrorScreen.kindOfTheIssue = {
  NotAllowedError: CameraNotAllowedError,
  DeviceOrientationError,
  DuplicateFoundError,
  UnrecoverableError,
}

export default ErrorScreen
