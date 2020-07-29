import React, { useCallback, useMemo, useRef } from 'react'
import { get } from 'lodash'

import CameraNotAllowedError from '../components/CameraNotAllowedError'
import DeviceOrientationError from '../components/DeviceOrientationError'
import DuplicateFoundError from '../components/DuplicateFoundError'
import GeneralError from '../components/GeneralError'
import UnrecoverableError from '../components/UnrecoverableError'

import GDStore from '../../../../lib/undux/GDStore'
import useVerificationAttempts from '../hooks/useVerificationAttempts'

import { getFirstWord } from '../../../../lib/utils/getFirstWord'

const ErrorScreen = ({ styles, screenProps }) => {
  const store = GDStore.useStore()
  const exception = get(screenProps, 'screenState.error')
  const kindOfTheIssue = get(exception, 'name')

  const { isReachedMaxAttempts } = useVerificationAttempts()

  // calling isReachedMaxAttempts once and storing result in the ref
  const isReachedMaxAttemptsRef = useRef(isReachedMaxAttempts())

  const displayTitle = useMemo(() => {
    const { fullName } = store.get('profile')

    return getFirstWord(fullName)
  }, [store])

  const onRetry = useCallback(() => screenProps.navigateTo('FaceVerificationIntro'), [screenProps])

  // determining error component to display
  // be default display general error
  let ErrorViewComponent = GeneralError
  const { kindOfTheIssue: map } = ErrorScreen

  // if reached max retries - showing 'something went wrong our side'
  if (isReachedMaxAttemptsRef.current) {
    ErrorViewComponent = UnrecoverableError

    // otherwise, if there's special screen for this kind of the issue hapened - showing it
  } else if (kindOfTheIssue in map) {
    ErrorViewComponent = map[kindOfTheIssue]
  }

  return <ErrorViewComponent onRetry={onRetry} displayTitle={displayTitle} screenProps={screenProps} />
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
