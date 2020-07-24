import React, { useCallback, useEffect, useMemo, useState } from 'react'
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

  const [isTracked, setTracked] = useState(false)
  const { attemptsCount, trackAttempt, resetAttempts, attemptsHistory } = useVerificationAttempts()

  const displayTitle = useMemo(() => {
    const { fullName } = store.get('profile')

    return getFirstWord(fullName)
  }, [store])

  const onRetry = useCallback(() => screenProps.navigateTo('FaceVerificationIntro'), [screenProps])

  const ErrorViewComponent = useMemo(() => {
    const { kindOfTheIssue: map } = ErrorScreen

    // if reached max retries - showing 'something went wrong our side'
    if (attemptsCount >= MAX_RETRIES_ALLOWED) {
      return UnrecoverableError
    }

    if (kindOfTheIssue in map) {
      return map[kindOfTheIssue]
    }

    return GeneralError
  }, [kindOfTheIssue, attemptsCount])

  // exception tracking
  useEffect(() => {
    if (attemptsCount > MAX_RETRIES_ALLOWED) {
      // reset/clear saved attempts count and messages
      // if exceeded max retries during last error screen shown
      resetAttempts()
    }

    // track attempt and save its exception
    trackAttempt(exception)

    // setting tracked flag
    setTracked(true)
  }, [])

  // rendering error screen once we've tracked an exception to avoid screens shift
  if (!isTracked) {
    return null
  }

  return (
    <ErrorViewComponent
      onRetry={onRetry}
      displayTitle={displayTitle}
      screenProps={screenProps}
      exception={exception}
      attemptsHistory={attemptsHistory}
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
