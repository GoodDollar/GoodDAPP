// libraries
import React, { useCallback, useEffect } from 'react'
import { View } from 'react-native'
import { get } from 'lodash'

//components
import Separator from '../../../common/layout/Separator'
import Text from '../../../common/view/Text'
import { CustomButton, Section, Wrapper } from '../../../common'
import FaceVerificationSmiley from '../../../common/animations/FaceVerificationSmiley'

// hooks
import useOnPress from '../../../../lib/hooks/useOnPress'
import useBrowserSupport from '../../../browserSupport/hooks/useBrowserSupport'
import usePermissions from '../../../permissions/hooks/usePermissions'
import useDisposingState from '../hooks/useDisposingState'

// utils
import UserStorage from '../../../../lib/gundb/UserStorage'
import GDStore from '../../../../lib/undux/GDStore'
import logger from '../../../../lib/logger/pino-logger'
import { getFirstWord } from '../../../../lib/utils/getFirstWord'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../../lib/utils/sizes'
import { withStyles } from '../../../../lib/styles'
import { isBrowser, isE2ERunning, isIOSWeb, isMobileSafari } from '../../../../lib/utils/platform'
import { openLink } from '../../../../lib/utils/linking'
import Config from '../../../../config/config'
import { Permissions } from '../../../permissions/types'
import { showQueueDialog } from '../../../common/dialogs/showQueueDialog'
import { fireEvent, FV_CAMERAPERMISSION, FV_CANTACCESSCAMERA, FV_INTRO } from '../../../../lib/analytics/analytics'

const log = logger.child({ from: 'FaceVerificationIntro' })

const WalletDeletedPopupText = ({ styles }) => (
  <View style={styles.paddingVertical20}>
    <Text style={styles.textStyle}>
      <Text style={[styles.textStyle, styles.paddingTop20]} fontWeight="bold">
        {'Since you’ve just deleted your wallet, '}
      </Text>
      you will have to wait 24 hours until you can claim.
    </Text>
    <Text style={[styles.textStyle, styles.paddingTop20]}>
      {'This is to prevent fraud and misuse.\nSorry for the inconvenience.'}
    </Text>
  </View>
)

const IntroScreen = ({ styles, screenProps }) => {
  const store = GDStore.useStore()
  const { fullName } = store.get('profile')
  const { screenState, goToRoot, navigateTo, pop } = screenProps
  const isValid = get(screenState, 'isValid', false)

  const navigateToHome = useCallback(() => navigateTo('Home'), [navigateTo])

  const disposing = useDisposingState({
    enrollmentIdentifier: UserStorage.getFaceIdentifier(),
    onComplete: isDisposing => {
      if (!isDisposing) {
        return
      }

      showQueueDialog(WalletDeletedPopupText, {
        onDismiss: goToRoot,
      })
    },
  })

  const openPrivacy = useOnPress(() => openLink(Config.faceVerificationPrivacyUrl), [])
  const openFaceVerification = () => screenProps.navigateTo('FaceVerification')

  const [, requestCameraPermissions] = usePermissions(Permissions.Camera, {
    requestOnMounted: false,
    onAllowed: openFaceVerification,
    onPrompt: () => fireEvent(FV_CAMERAPERMISSION),
    onDenied: () => fireEvent(FV_CANTACCESSCAMERA),
    navigate: navigateTo,
  })

  const [, checkForBrowserSupport] = useBrowserSupport({
    onSupported: requestCameraPermissions,
    onUnsupported: navigateToHome,
    onlyIOS: true,
  })

  const handleVerifyClick = useOnPress(() => {
    // if cypress is running - just redirect to FR as we're skipping
    // zoom componet (which requires camera access) in this case
    if (isE2ERunning) {
      openFaceVerification()
      return
    }

    checkForBrowserSupport()
  }, [checkForBrowserSupport])

  const commonTextStyles = {
    textAlign: 'center',
    color: 'primary',
    fontSize: 18,
    lineHeight: 25,
  }

  useEffect(() => log.debug({ isIOS: isIOSWeb, isMobileSafari }), [])

  useEffect(() => {
    if (isValid) {
      pop({ isValid: true })
    } else {
      fireEvent(FV_INTRO)
    }
  }, [isValid])

  return (
    <Wrapper>
      <Section style={styles.topContainer} grow>
        <View style={styles.mainContent}>
          <Section.Title fontWeight="medium" textTransform="none" style={styles.mainTitle}>
            {`${getFirstWord(fullName)},\nOnly a real live person\ncan claim G$’s`}
          </Section.Title>
          <View style={styles.illustration}>
            <FaceVerificationSmiley />
          </View>
          <View>
            <Separator width={2} />
            <Text textAlign="center" style={styles.descriptionContainer}>
              <Text {...commonTextStyles} fontWeight="bold">
                {`Once in a while\n`}
              </Text>
              <Text {...commonTextStyles}>{`we'll need to take a short video of you\n`}</Text>
              <Text {...commonTextStyles}>{`to prevent duplicate accounts.\n`}</Text>
              <Text
                {...commonTextStyles}
                fontWeight="bold"
                textDecorationLine="underline"
                style={styles.descriptionUnderline}
                onPress={openPrivacy}
              >
                {`Learn more`}
              </Text>
            </Text>
            <Separator style={[styles.bottomSeparator]} width={2} />
          </View>
          <CustomButton style={[styles.button]} onPress={handleVerifyClick} disabled={false !== disposing}>
            OK, VERIFY ME
          </CustomButton>
        </View>
      </Section>
    </Wrapper>
  )
}

IntroScreen.navigationOptions = {
  navigationBarHidden: false,
  title: 'Face Verification',
}

const getStylesFromProps = ({ theme }) => ({
  topContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.sizes.borderRadius,
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    paddingBottom: getDesignRelativeHeight(theme.sizes.defaultDouble),
    paddingLeft: getDesignRelativeWidth(theme.sizes.default),
    paddingRight: getDesignRelativeWidth(theme.sizes.default),
    paddingTop: getDesignRelativeHeight(theme.sizes.defaultDouble),
  },
  mainContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingLeft: getDesignRelativeWidth(theme.sizes.default * 3),
    paddingRight: getDesignRelativeWidth(theme.sizes.default * 3),
    width: '100%',
  },
  mainTitle: {
    marginTop: getDesignRelativeHeight(isBrowser ? 30 : 15),
  },
  illustration: {
    marginTop: getDesignRelativeHeight(18),
    marginBottom: getDesignRelativeHeight(18),
    height: getDesignRelativeWidth(isBrowser ? 220 : 130),
    width: '100%',
  },
  descriptionContainer: {
    paddingHorizontal: getDesignRelativeHeight(theme.sizes.defaultHalf),
    paddingVertical: getDesignRelativeHeight(isBrowser ? theme.sizes.defaultDouble : 14),
  },
  descriptionUnderline: {
    display: 'block',
    paddingTop: getDesignRelativeHeight(isBrowser ? theme.sizes.defaultQuadruple : theme.sizes.defaultDouble),
  },
  button: {
    width: '100%',
  },
  bottomSeparator: {
    marginBottom: getDesignRelativeHeight(25),
  },
})

export default withStyles(getStylesFromProps)(IntroScreen)
