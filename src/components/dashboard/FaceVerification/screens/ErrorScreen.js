import React, { useCallback, useMemo } from 'react'
import { get } from 'lodash'

import CameraNotAllowedError from '../components/CameraNotAllowedError'
import DeviceOrientationError from '../components/DeviceOrientationError'
import DuplicateFoundError from '../components/DuplicateFoundError'
import NotMatchError from '../components/NotMatchError'
import GeneralError from '../components/GeneralError'
import UnrecoverableError from '../components/UnrecoverableError'
import SwitchToAnotherDevice from '../components/SwitchToAnotherDevice'

import GDStore from '../../../../lib/undux/GDStore'
import useVerificationAttempts from '../hooks/useVerificationAttempts'

import { getFirstWord } from '../../../../lib/utils/getFirstWord'

const ErrorScreen = ({ styles, screenProps, navigation }) => {
  const store = GDStore.useStore()
  const { isReachedMaxAttempts } = useVerificationAttempts()

  const exception = get(screenProps, 'screenState.error')
  const kindOfTheIssue = get(exception, 'name')

  const title = useMemo(() => {
    const { fullName } = store.get('profile')

    return getFirstWord(fullName)
  }, [store])

  const onRetry = useCallback(() => screenProps.navigateTo('FaceVerificationIntro'), [screenProps])

  const ErrorViewComponent = useMemo(() => {
    // determining error component to display
    // be default display general error
    let component = GeneralError
    const { kindOfTheIssue: map } = ErrorScreen

    // if reached max retries - showing 'something went wrong our side'
    if (isReachedMaxAttempts() && 'UnrecoverableError' !== kindOfTheIssue) {
      component = SwitchToAnotherDevice

      // otherwise, if there's special screen for this kind of the issue hapened - showing it
    } else if (kindOfTheIssue in map) {
      component = map[kindOfTheIssue]
    }

    return component
  }, [isReachedMaxAttempts, kindOfTheIssue])

  if (!ErrorViewComponent) {
    return null
  }

  return <ErrorViewComponent onRetry={onRetry} displayTitle={title} nav={screenProps} exception={exception} />
}

ErrorScreen.navigationOptions = {
  title: 'Face Verification',
  navigationBarHidden: false,
}

ErrorScreen.kindOfTheIssue = {
  NotMatchError,
  UnrecoverableError,
  DuplicateFoundError,
  DeviceOrientationError,
  NotAllowedError: CameraNotAllowedError,
  NotSupportedError: SwitchToAnotherDevice,
}

export default ErrorScreen
