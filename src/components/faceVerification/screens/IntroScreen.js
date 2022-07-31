// libraries
import React, { useCallback, useContext, useEffect, useMemo } from 'react'
import { Platform, View } from 'react-native'

import { get } from 'lodash'

//components
import { t } from '@lingui/macro'
import Text from '../../common/view/Text'
import { CustomButton, Section, Wrapper } from '../../common'

// hooks
import useOnPress from '../../../lib/hooks/useOnPress'
import useCameraSupport from '../../browserSupport/hooks/useCameraSupport'
import usePermissions from '../../permissions/hooks/usePermissions'
import useDisposingState from '../hooks/useDisposingState'
import useEnrollmentIdentifier from '../hooks/useEnrollmentIdentifier'

// utils
import logger from '../../../lib/logger/js-logger'
import { getFirstWord } from '../../../lib/utils/getFirstWord'
import { getDesignRelativeHeight, getDesignRelativeWidth, isSmallDevice } from '../../../lib/utils/sizes'
import { withStyles } from '../../../lib/styles'
import { isBrowser, isEmulator, isIOSWeb, isMobileSafari } from '../../../lib/utils/platform'
import { openLink } from '../../../lib/utils/linking'
import Config from '../../../config/config'
import { Permissions } from '../../permissions/types'
import { showQueueDialog } from '../../common/dialogs/showQueueDialog'
import { useDialog } from '../../../lib/dialog/useDialog'
import { fireEvent, FV_CAMERAPERMISSION, FV_CANTACCESSCAMERA, FV_INTRO } from '../../../lib/analytics/analytics'
import { FVFlowContext } from '../standalone/context/FVFlowContext'
import useFaceTecSDK from '../hooks/useFaceTecSDK'

// assets
import wait24hourIllustration from '../../../assets/Claim/wait24Hour.svg'
import FashionShootSVG from '../../../assets/FaceVerification/FashionPhotoshoot.svg'
import useProfile from '../../../lib/userStorage/useProfile'

const log = logger.child({ from: 'FaceVerificationIntro' })

const WalletDeletedPopupText = ({ styles }) => (
  <View style={styles.wrapper}>
    <View style={styles.title}>
      <Text textAlign="left" fontSize={22} lineHeight={28} fontWeight="medium">
        {t`New Wallet?`}
        {t`You’ll need to wait 24 hours`}
      </Text>
    </View>
    <View style={styles.paddingVertical20}>
      <Text style={styles.textStyle}>
        {t`We see you recently deleted your wallet and have opened a new one.`}
        {t`This delay is to prevent misuse, thanks for understanding!`}
      </Text>
    </View>
  </View>
)

const Intro = ({ styles, firstName, ready, onVerify, onLearnMore }) => (
  <Wrapper>
    <Section style={styles.topContainer} grow>
      <View style={styles.mainContent}>
        <Section.Title fontWeight="bold" textTransform="none" style={styles.mainTitle}>
          {firstName && `${firstName},`}
          <Section.Text fontWeight="regular" textTransform="none" fontSize={24} lineHeight={30}>
            {firstName ? `\n` : ''}
            {'Verify you are a real\nlive person'}
          </Section.Text>
        </Section.Title>
        <Section.Text fontSize={18} lineHeight={25} letterSpacing={0.18} style={styles.mainText}>
          {t`Your image is only used to prevent the creation of duplicate accounts and will never be transferred to any third party`}
        </Section.Text>
        <Section.Text
          fontWeight="bold"
          fontSize={18}
          lineHeight={26}
          textDecorationLine="underline"
          style={styles.learnMore}
          onPress={onLearnMore}
        >
          {t`Learn More`}
        </Section.Text>
        <View style={styles.illustration}>
          <FashionShootSVG />
        </View>
        <CustomButton style={[styles.button]} onPress={onVerify} disabled={!ready}>
          {t`OK, VERIFY ME`}
        </CustomButton>
      </View>
    </Section>
  </Wrapper>
)

const IntroScreen = ({ styles, screenProps, navigation }) => {
  const { fullName } = useProfile()
  const { showDialog } = useDialog()

  const { firstName, isFVFlow, fvFlowError, isFVFlowReady } = useContext(FVFlowContext)
  const { screenState, goToRoot, navigateTo, pop, push } = screenProps
  const isValid = get(screenState, 'isValid', false)
  const { navigate } = navigation

  const enrollmentIdentifier = useEnrollmentIdentifier()
  const userName = useMemo(() => (isFVFlow ? firstName : getFirstWord(fullName)), [isFVFlow, firstName, fullName])

  const navigateToHome = useCallback(() => navigateTo('Home'), [navigateTo])

  const [disposing, checkDisposalState] = useDisposingState(
    {
      requestOnMounted: false,
      enrollmentIdentifier,
      onComplete: isDisposing => {
        if (!isDisposing) {
          return
        }

        const dialogData = showQueueDialog(WalletDeletedPopupText, {
          onDismiss: goToRoot,
          imageSource: wait24hourIllustration,
        })
        showDialog(dialogData)
      },
    },
    [enrollmentIdentifier],
  )

  const openPrivacy = useOnPress(() => openLink(Config.faceVerificationPrivacyUrl), [])
  const openFaceVerification = useCallback(() => push('FaceVerification'), [push])

  const [, requestCameraPermissions] = usePermissions(Permissions.Camera, {
    requestOnMounted: false,
    onAllowed: openFaceVerification,
    onPrompt: () => fireEvent(FV_CAMERAPERMISSION),
    onDenied: () => fireEvent(FV_CANTACCESSCAMERA),
    navigate: navigateTo,
  })

  const [, checkForCameraSupport] = useCameraSupport({
    checkOnMounted: false,
    onSupported: requestCameraPermissions,
    onUnsupported: navigateToHome,
  })

  const handleVerifyClick = useCallback(async () => {
    const isDeviceEmulated = await isEmulator

    // if cypress is running - just redirect to FR as we're skipping
    // zoom componet (which requires camera access) in this case
    if (isDeviceEmulated) {
      openFaceVerification()
      return
    }

    checkForCameraSupport()
  }, [checkForCameraSupport])

  useFaceTecSDK() // early initialize

  useEffect(() => log.debug({ isIOS: isIOSWeb, isMobileSafari }), [])

  useEffect(() => {
    log.debug({ enrollmentIdentifier, userName })

    if (isValid) {
      const state = { isValid }

      isFVFlow ? navigateTo('FVFlowSuccess', state) : pop(state)
      return
    }

    if (enrollmentIdentifier && (!isFVFlow || isFVFlowReady)) {
      fireEvent(FV_INTRO)
      checkDisposalState()
    }
  }, [enrollmentIdentifier, isFVFlow, isFVFlowReady, navigateTo, pop, checkDisposalState])

  useEffect(() => {
    if (!isFVFlow || !navigate) {
      return
    }

    if (fvFlowError || !enrollmentIdentifier) {
      navigate('FVFlowError')
    }
  }, [isFVFlow, enrollmentIdentifier, fvFlowError, navigate])

  return (
    <Intro
      styles={styles}
      firstName={userName}
      onLearnMore={openPrivacy}
      onVerify={handleVerifyClick}
      ready={false === disposing}
    />
  )
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
    paddingBottom: getDesignRelativeHeight(isSmallDevice ? 10 : theme.sizes.defaultDouble),
    paddingLeft: getDesignRelativeWidth(theme.sizes.default),
    paddingRight: getDesignRelativeWidth(theme.sizes.default),
    paddingTop: getDesignRelativeHeight(isSmallDevice ? 10 : theme.sizes.defaultDouble),
    marginBottom: theme.paddings.bottomPadding,
  },
  mainContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    width: '100%',
  },
  mainTitle: {
    marginTop: getDesignRelativeHeight(isBrowser ? 16 : 8),
  },
  mainText: {
    marginTop: getDesignRelativeHeight(isSmallDevice ? 12 : theme.sizes.defaultDouble),
  },
  illustration: {
    marginTop: getDesignRelativeHeight(20),
    marginBottom: getDesignRelativeHeight(31),
    width: '100%',
    alignItems: 'center',
  },
  descriptionContainer: {
    paddingHorizontal: getDesignRelativeHeight(theme.sizes.defaultHalf),
    paddingVertical: getDesignRelativeHeight(isSmallDevice ? 8 : 14),
  },
  descriptionUnderline: {
    display: Platform.select({ web: 'block', default: 'flex' }),
    paddingTop: getDesignRelativeHeight(isBrowser ? theme.sizes.defaultQuadruple : theme.sizes.defaultDouble),
  },
  button: {
    width: '100%',
  },
  bottomSeparator: {
    marginBottom: getDesignRelativeHeight(isSmallDevice ? theme.sizes.defaultDouble : 25),
  },
  learnMore: {
    color: theme.colors.primary,
    marginTop: getDesignRelativeHeight(isSmallDevice ? theme.sizes.defaultDouble : 20),
  },
})

export default withStyles(getStylesFromProps)(IntroScreen)
