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

  const [verificationAttempts, trackNewAttempt, resetAttempts] = useVerificationAttempts()

  // storing first received attempts count into the ref to avoid component re-updated after attempt tracked
  const verificationAttemptsRef = useRef(verificationAttempts)

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
      resetAttempts()
      return UnrecoverableError
    }

    return GeneralError

    // isGeneralError depends from kindOfTheIssue so we could omit it in the deps list
  }, [kindOfTheIssue, resetAttempts])

  useEffect(() => {
    if (!isGeneralError) {
      return
    }

    // tracking attempt here as we should track only "general" error
    // (when "something went wrong on our side")
    trackNewAttempt()
  }, [])

  return (
    <ErrorViewComponent onRetry={onRetry} displayTitle={displayTitle} screenProps={screenProps} exception={exception} />
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
