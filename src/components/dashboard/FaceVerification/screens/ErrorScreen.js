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

const ErrorScreen = ({ styles, screenProps }) => {
  const store = GDStore.useStore()
  const exception = get(screenProps, 'screenState.error')
  const kindOfTheIssue = get(exception, 'name')

  const errorViewComponentRef = useRef(null)
  const { isReachedMaxAttempts } = useVerificationAttempts()

  const displayTitle = useMemo(() => {
    const { fullName } = store.get('profile')

    return getFirstWord(fullName)
  }, [store])

  const onRetry = useCallback(() => screenProps.navigateTo('FaceVerificationIntro'), [screenProps])

  useEffect(() => {
    // determining error component to display
    // be default display general error
    let component = GeneralError
    const { kindOfTheIssue: map } = ErrorScreen

    // if reached max retries - showing 'something went wrong our side'
    if (isReachedMaxAttempts()) {
      component = UnrecoverableError

      // otherwise, if there's special screen for this kind of the issue hapened - showing it
    } else if (kindOfTheIssue in map) {
      component = map[kindOfTheIssue]
    }

    errorViewComponentRef.current = component
  }, [])

  const { current: ErrorViewComponent } = errorViewComponentRef

  if (!ErrorViewComponent) {
    return
  }

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
