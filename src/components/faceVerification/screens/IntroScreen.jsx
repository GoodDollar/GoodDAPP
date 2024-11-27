// libraries
import React, { useCallback, useContext, useEffect, useMemo } from 'react'
import { ActivityIndicator, Image, Platform, View } from 'react-native'
import { t } from '@lingui/macro'
import { useIdentityExpiryDate } from '@gooddollar/web3sdk-v2'

import useFVRedirect from '../standalone/hooks/useFVRedirect'

// components
import Text from '../../common/view/Text'
import { CustomButton, Section, Wrapper } from '../../common'

// hooks
import useOnPress from '../../../lib/hooks/useOnPress'
import useCameraSupport from '../../browserSupport/hooks/useCameraSupport'
import usePermissions from '../../permissions/hooks/usePermissions'
import useDisposingState from '../hooks/useDisposingState'
import useEnrollmentIdentifier from '../hooks/useEnrollmentIdentifier'

import { useWallet } from '../../../lib/wallet/GoodWalletProvider'

// utils
import logger from '../../../lib/logger/js-logger'
import { getFirstWord } from '../../../lib/utils/getFirstWord'
import {
  getDesignRelativeHeight,
  getDesignRelativeWidth,
  isLargeDevice,
  isMediumDevice,
  isSmallDevice,
} from '../../../lib/utils/sizes'
import { withStyles } from '../../../lib/styles'
import { iosSupportedWeb, isBrowser, isEmulator, isIOSWeb, isWebView } from '../../../lib/utils/platform'
import { openLink } from '../../../lib/utils/linking'
import Config from '../../../config/config'
import { Permissions } from '../../permissions/types'
import { showQueueDialog } from '../../common/dialogs/showQueueDialog'
import { useDialog } from '../../../lib/dialog/useDialog'
import { fireEvent, FV_CAMERAPERMISSION, FV_CANTACCESSCAMERA, FV_INTRO } from '../../../lib/analytics/analytics'
import { FVFlowContext } from '../standalone/context/FVFlowContext'
import useFaceTecSDK from '../hooks/useFaceTecSDK'
import { UnsupportedWebview } from '../../browserSupport/components/UnsupportedBrowser'
import AsyncStorage from '../../../lib/utils/asyncStorage'

// assets
import Wait24HourSVG from '../../../assets/Claim/wait24Hour.svg'

import FashionShootSVG from '../../../assets/FaceVerification/FashionPhotoshoot.svg'
import BillyVerifies from '../../../assets/billy-verifies.png'
import useProfile from '../../../lib/userStorage/useProfile'
import useFVLoginInfoCheck from '../standalone/hooks/useFVLoginInfoCheck'

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

const IntroReVerification = ({ styles, firstName, ready, onVerify, onLearnMore }) => (
  <Wrapper withMaxHeight={false}>
    <Section style={styles.topContainer} grow>
      <View style={styles.mainContent}>
        <Section.Title fontWeight="bold" textTransform="none" style={styles.mainTitle}>
          {firstName ? `${firstName},` : ``}
          <Section.Text fontWeight="bold" textTransform="none" color="#00AEFF" fontSize={30} lineHeight={30}>
            {firstName ? `\n` : ''}
            {t`It’s time to update
  your Face Verification!`}
            {`\n`}
          </Section.Text>
        </Section.Title>
        <Section style={styles.mainText}>
          <Section.Text textAlign="left" fontSize={18} lineHeight={25} letterSpacing={0.18}>
            {t`Every so often, it's necessary to double-check that you're still you. You’ll go through the same verification process you went through when you first signed up for GoodDollar.`}
          </Section.Text>
          <Section.Text textAlign="left" fontSize={18} lineHeight={25} letterSpacing={0.18} style={styles.mainText}>
            {t`You’ll be able to claim once this process is complete.`}
          </Section.Text>
        </Section>
        <View style={styles.illustrationContainer}>
          <Image source={BillyVerifies} style={styles.image} />
        </View>
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
        <CustomButton style={[styles.button]} onPress={onVerify} disabled={!ready}>
          {t`Continue`}
        </CustomButton>
      </View>
    </Section>
  </Wrapper>
)

const Intro = ({ styles, firstName, ready, onVerify, onLearnMore, onDeny }) => (
  <Wrapper withMaxHeight={false}>
    <Section style={styles.topContainer} grow>
      <View style={styles.mainContent}>
        <Section.Title fontWeight="bold" textTransform="none" style={styles.mainTitle}>
          {firstName ? `${firstName},` : ``}
          <Section.Text fontWeight="bold" color="#00AEFF" textTransform="none" fontSize={24} lineHeight={30}>
            {firstName ? `\n` : ''}
            {t`You are almost there!`}
            {`\n`}
          </Section.Text>
        </Section.Title>
        <Section.Text
          fontSize={18}
          lineHeight={25}
          letterSpacing={0.18}
          fontWeight="700"
        >{t`To continue, you need to be a unique human and prove it with your camera.`}</Section.Text>
        <Section.Text fontSize={18} lineHeight={25} letterSpacing={0.18}>
          {t`Your image is only used to ensure you’re you and prevent duplicate accounts.`}
        </Section.Text>
        <Section.Text
          fontWeight="bold"
          fontSize={18}
          lineHeight={26}
          textDecorationLine="underline"
          color="#00AEFF"
          onPress={onLearnMore}
        >
          {t`Learn More`}
        </Section.Text>
        <View style={styles.illustrationContainer} marginTop={0}>
          <FashionShootSVG />
        </View>
        <View style={{ marginTop: 50 }}>
          <CustomButton style={styles.button} onPress={onVerify} disabled={!ready}>
            {t`I'M OVER 18, CONTINUE`}
          </CustomButton>
          <CustomButton
            style={[styles.button]}
            onPress={() => onDeny(`not 18 or didn't accept`)}
            disabled={!ready}
            mode="outlined"
          >
            {t`I Don't agree Or I'M NOT OVER 18`}
          </CustomButton>
        </View>
      </View>
    </Section>
  </Wrapper>
)

const IntroScreen = ({ styles, screenProps, navigation }) => {
  const { fullName } = useProfile()
  const { showDialog } = useDialog()

  const { account: externalAccount, isDelta, firstName, isFVFlow, isFVFlowReady } = useContext(FVFlowContext)
  const goodWallet = useWallet()
  const { account } = goodWallet ?? {}
  const [expiryDate, , state] = useIdentityExpiryDate(externalAccount || account)
  const isReverify = expiryDate?.lastAuthenticated?.isZero() === false

  const { goToRoot, navigateTo, push } = screenProps
  const fvRedirect = useFVRedirect()
  const { faceIdentifier: enrollmentIdentifier, v1FaceIdentifier: fvSigner } = useEnrollmentIdentifier()
  const userName = useMemo(
    () => (firstName ? (isFVFlow ? firstName : getFirstWord(fullName)) : ''),
    [isFVFlow, firstName, fullName],
  )

  const onDeny = useCallback(
    reason => {
      return isFVFlow ? fvRedirect(false, reason) : goToRoot()
    },
    [isFVFlow],
  )

  const [disposing, checkDisposalState] = useDisposingState({
    requestOnMounted: false,
    enrollmentIdentifier,
    fvSigner,
    onComplete: isDisposing => {
      if (!isDisposing) {
        return
      }

      const dialogData = showQueueDialog(WalletDeletedPopupText, true, {
        onDismiss: () => onDeny('Wait 24 hours'),
        imageSource: Wait24HourSVG,
      })

      showDialog(dialogData)
    },
  })

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
    onUnsupported: () => {
      requestCameraPermissions({ ignoreMountedState: true }) // we let the user try anyways. we add ignoreMOuntedState because when showing the unsupportedbrowser popup it unmounts
    },
    unsupportedPopup: UnsupportedWebview,
    onCheck: () => !isDelta || (!isWebView && (!isIOSWeb || iosSupportedWeb)),
  })

  const handleVerifyClick = useCallback(async () => {
    const isDeviceEmulated = await isEmulator

    // if cypress is running - just redirect to FR as we're skipping
    // zoom component (which requires camera access) in this case
    if (isDeviceEmulated) {
      openFaceVerification()
      return
    }

    checkForCameraSupport()
  }, [checkForCameraSupport])

  useFaceTecSDK({ initOnMounted: true }) // early initialize

  useEffect(() => {
    log.debug({ enrollmentIdentifier, userName, isFVFlow, isFVFlowReady })

    AsyncStorage.setItem('hasStartedFV', 'true')

    if (enrollmentIdentifier && state !== 'pending' && (!isFVFlow || isFVFlowReady)) {
      fireEvent(FV_INTRO, { reverify: isReverify })
      checkDisposalState()
    }
  }, [enrollmentIdentifier, isFVFlow, isFVFlowReady, navigateTo, isReverify, state, checkDisposalState])

  useFVLoginInfoCheck(navigation)

  if (state === 'pending') {
    return (
      <View display="flex" justifyContent="center">
        <ActivityIndicator size="large" style={{ marginTop: 10 }} />
      </View>
    )
  }

  if (isReverify) {
    return (
      <IntroReVerification
        styles={styles}
        firstName={userName}
        onLearnMore={openPrivacy}
        onVerify={handleVerifyClick}
        ready={false === disposing}
      />
    )
  }

  return (
    <Intro
      styles={styles}
      firstName={userName}
      onLearnMore={openPrivacy}
      onVerify={handleVerifyClick}
      onDeny={onDeny}
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

    paddingLeft: Platform.select({
      web: !isMediumDevice ? getDesignRelativeWidth(theme.sizes.default) : 5,
    }),
    paddingRight: getDesignRelativeWidth(theme.sizes.default),
    paddingTop: getDesignRelativeHeight(isMediumDevice ? 10 : theme.sizes.defaultDouble),
    marginBottom: theme.paddings.bottomPadding,
  },
  mainContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Platform.select({
      web: !isMediumDevice ? 32 : 0,
    }),
    width: '100%',
  },
  mainTitle: {
    marginTop: getDesignRelativeHeight(isBrowser ? 16 : 8),
  },
  mainText: {
    marginTop: Platform.select({
      web: !isSmallDevice ? getDesignRelativeHeight(20) : 0,
    }),
  },
  illustrationContainer: {
    marginTop: getDesignRelativeHeight(20),

    marginBottom: Platform.select({
      web: !isMediumDevice ? getDesignRelativeHeight(31) : 0,
    }),
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
    ...Platform.select({
      web: {
        width: !isMediumDevice ? 160 : 120,
        height: !isMediumDevice ? 160 : 120,
      },
      default: {
        width: 120,
        height: 120,
      },
    }),
  },
  image: {
    ...Platform.select({
      web: { resizeMode: 'center', width: !isMediumDevice ? 160 : 120, height: !isMediumDevice ? 160 : 120 },
      android: { resizeMode: 'contain', width: 120, height: 120 },
    }),
    marginLeft: 'auto',
  },
  descriptionContainer: {
    paddingHorizontal: Platform.select({
      web: !isSmallDevice ? getDesignRelativeHeight(theme.sizes.defaultHalf) : 0,
    }),

    paddingVertical: getDesignRelativeHeight(isMediumDevice ? 8 : 14),
  },
  descriptionUnderline: {
    display: Platform.select({ web: 'block', default: 'flex' }),
    paddingTop: getDesignRelativeHeight(isBrowser ? theme.sizes.defaultQuadruple : theme.sizes.defaultDouble),
  },
  button: {
    width: '100%',
    marginTop: 20,
  },
  bottomSeparator: {
    marginBottom: getDesignRelativeHeight(isSmallDevice ? theme.sizes.defaultDouble : 25),
  },
  learnMore: {
    color: theme.colors.primary,
    marginTop: getDesignRelativeHeight(isSmallDevice ? theme.sizes.defaultDouble : 20),
  },
  buttonContainer: {
    marginTop: !isLargeDevice ? 50 : 0,
  },
})

export default withStyles(getStylesFromProps)(IntroScreen)
