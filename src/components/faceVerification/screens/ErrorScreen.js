import React, { useCallback, useContext, useMemo, useState } from 'react'
import { get } from 'lodash'
import { View } from 'react-native'

import CameraNotAllowedError from '../components/CameraNotAllowedError'
import DeviceOrientationError from '../components/DeviceOrientationError'
import DuplicateFoundError from '../components/DuplicateFoundError'
import NotMatchError from '../components/NotMatchError'
import GeneralError from '../components/GeneralError'
import UnrecoverableError from '../components/UnrecoverableError'
import SwitchToAnotherDevice from '../components/SwitchToAnotherDevice'

import useVerificationAttempts from '../hooks/useVerificationAttempts'

import { getFirstWord } from '../../../lib/utils/getFirstWord'
import useProfile from '../../../lib/userStorage/useProfile'
import { FVFlowContext } from '../standalone/context/FVFlowContext'
import { Wrapper } from '../../common'
import ErrorButtons from '../components/ErrorButtons'
import { withStyles } from '../../../lib/styles'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../lib/utils/sizes'
import { useEffectOnce } from '../../../lib/hooks/useEffectOnce'

const getStylesFromProps = ({ theme }) => ({
  topContainer: {
    alignItems: 'center',
    justifyContent: 'space-evenly',
    display: 'flex',
    backgroundColor: theme.colors.surface,
    height: '100%',
    flex: 1,
    flexGrow: 1,
    flexShrink: 0,
    paddingBottom: getDesignRelativeHeight(theme.sizes.defaultDouble),
    paddingLeft: getDesignRelativeWidth(theme.sizes.default),
    paddingRight: getDesignRelativeWidth(theme.sizes.default),
    paddingTop: getDesignRelativeHeight(theme.sizes.defaultDouble),
    borderRadius: 5,
    marginBottom: theme.paddings.bottomPadding,
  },
})

const ErrorScreen = ({ styles, screenProps, navigation }) => {
  const profile = useProfile()
  const { isReachedMaxAttempts } = useVerificationAttempts()
  const { isFVFlow } = useContext(FVFlowContext)
  const [{ ErrorViewComponent, reachedMax }, setDisplayState] = useState({})

  const exception = get(screenProps, 'screenState.error')
  const kindOfTheIssue = get(exception, 'name')

  const title = useMemo(() => {
    const { fullName } = profile

    return getFirstWord(fullName)
  }, [profile])

  const onRetry = useCallback(() => screenProps.navigateTo('FaceVerificationIntro'), [screenProps])

  useEffectOnce(() => {
    // determining error component to display
    // be default display general error
    let component = GeneralError
    const { kindOfTheIssue: map } = ErrorScreen
    const reachedMax = isReachedMaxAttempts()

    // if reached max retries - showing 'something went wrong our side'
    if (reachedMax && 'UnrecoverableError' !== kindOfTheIssue) {
      component = SwitchToAnotherDevice

      // otherwise, if there's special screen for this kind of the issue hapened - showing it
    } else if (kindOfTheIssue in map) {
      component = map[kindOfTheIssue]
    }

    setDisplayState({ ErrorViewComponent: component, reachedMax })
  }, [isReachedMaxAttempts, kindOfTheIssue])

  if (!ErrorViewComponent) {
    return null
  }

  return (
    <Wrapper>
      <View style={styles.topContainer}>
        <ErrorViewComponent
          displayTitle={title}
          nav={screenProps}
          exception={exception}
          isFVFlow={isFVFlow}
          reachedMax={reachedMax}
        />
        <ErrorButtons onRetry={onRetry} navigation={navigation} reachedMax={reachedMax} />
      </View>
    </Wrapper>
  )
}

ErrorScreen.kindOfTheIssue = {
  NotMatchError,
  UnrecoverableError,
  DuplicateFoundError,
  DeviceOrientationError,
  NotAllowedError: CameraNotAllowedError,
  NotSupportedError: SwitchToAnotherDevice,
}

export default withStyles(getStylesFromProps)(ErrorScreen)
