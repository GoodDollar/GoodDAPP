import { createElement, useCallback, useMemo } from 'react'
import { get } from 'lodash'

import CameraNotAllowedError from '../components/CameraNotAllowedError'
import DeviceOrientationError from '../components/DeviceOrientationError'
import DuplicateFoundError from '../components/DuplicateFoundError'
import GeneralError from '../components/GeneralError'
import UnrecoverableError from '../components/UnrecoverableError'

import GDStore from '../../../../lib/undux/GDStore'
import { getFirstWord } from '../../../../lib/utils/getFirstWord'

const ErrorScreen = ({ styles, screenProps }) => {
  const store = GDStore.useStore()
  const kindOfTheIssue = get(screenProps, 'screenState.error.name')

  const displayTitle = useMemo(() => {
    const { fullName } = store.get('profile')

    return `${getFirstWord(fullName)}`
  }, [store])

  const onRetry = useCallback(() => screenProps.navigateTo('FaceVerificationIntro'), [screenProps])

  const errorViewComponent = useMemo(() => {
    if (!kindOfTheIssue || !(kindOfTheIssue in ErrorScreen.kindOfTheIssue)) {
      return GeneralError
    }

    return ErrorScreen.kindOfTheIssue[kindOfTheIssue]
  }, [kindOfTheIssue])

  return createElement(errorViewComponent, { onRetry, displayTitle, screenProps })
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
