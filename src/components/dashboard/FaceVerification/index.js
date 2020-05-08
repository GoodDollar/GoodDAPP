import React, { useCallback } from 'react'

import SpinnerCheckMark from '../../common/animations/SpinnerCheckMark/SpinnerCheckMark'
import Section from '../../common/layout/Section'

import UserStorage from '../../../lib/gundb/UserStorage'
import { useCurriedSetters } from '../../../lib/undux/GDStore'
import goodWallet from '../../../lib/wallet/GoodWallet'
import useZoomSDK from './hooks/useZoomSDK'
import useZoomVerification from './hooks/useZoomVerification'
import { kindOfSDKIssue, kindOfSessionIssue } from './utils/kindOfTheIssue'

const FaceVerification = ({ screenProps }) => {
  const [setIsCitizen] = useCurriedSetters(['isLoggedInCitizen'])

  // Redirects to the error screen, passing exception
  // object and allowing to show/hide retry button (hides it by default)
  const showErrorScreen = useCallback(
    (error, allowRetry = false) => {
      screenProps.navigateTo('FaceVerificationError', { error, allowRetry })
    },
    [screenProps]
  )

  // ZoomSDK session completition handler
  const completionHandler = useCallback(async () => {
    const isCitizen = await goodWallet.isCitizen()

    // if session was successfull - whitelistening user
    // and returning sucecss to the caller
    setIsCitizen(isCitizen)
    screenProps.pop({ isValid: true })
  }, [screenProps, setIsCitizen])

  // ZoomSDK session exception handler
  const exceptionHandler = useCallback(
    exception => {
      // the following code is needed for ErrorScreen component
      // could display specific error message corresponding to
      // the kind of issue (camera, orientation etc)
      const kindOfTheIssue = kindOfSessionIssue(exception)

      if ('UserCancelled' === kindOfTheIssue) {
        // If user has cancelled face verification by own
        // decision - redirecting back to the into screen
        screenProps.navigateTo('FaceVerificationIntro')
        return
      }

      if (kindOfTheIssue) {
        exception.name = kindOfTheIssue
      } else if (exception.message.startsWith('Duplicate')) {
        exception.name = 'DuplicateFoundError'
      }

      // handling error
      showErrorScreen(exception, true)
    },
    [screenProps, showErrorScreen]
  )

  // ZoomSDK initialization error handler
  const sdkExceptionHandler = useCallback(
    exception => {
      // the following code is needed for ErrorScreen component
      // could display specific error message corresponding to
      // the kind of issue (camera, orientation etc)
      const kindOfTheIssue = kindOfSDKIssue(exception)

      if (kindOfTheIssue) {
        exception.name = kindOfTheIssue
      }

      // handling error
      showErrorScreen(exception, false)
    },
    [showErrorScreen]
  )

  // Using zoom verification hook, passing completion callback
  const startVerification = useZoomVerification({
    enrollmentIdentifier: UserStorage.getFaceIdentifier(),
    onComplete: completionHandler,
    onError: exceptionHandler,
  })

  // using zoom sdk initialization hook
  // starting verification once sdk sucessfully initializes
  // on error redirecting to the error screen
  const isInitialized = useZoomSDK({
    onInitialized: startVerification,
    onError: sdkExceptionHandler,
  })

  if (isInitialized) {
    return null
  }

  return (
    <Section grow justifyContent="flex-start">
      <Section.Row alignItems="center" justifyContent="center">
        <SpinnerCheckMark loading success={false} />
      </Section.Row>
    </Section>
  )
}

FaceVerification.navigationOptions = {
  title: 'Face Verification',
  navigationBarHidden: false,
}

export default FaceVerification
