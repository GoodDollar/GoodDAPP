// libraries
import React, { useCallback, useContext, useEffect } from 'react'
import { Platform, View } from 'react-native'
import { get } from 'lodash'

//components
// import Separator from '../../../common/layout/Separator'
import { t } from '@lingui/macro'
import Text from '../../../common/view/Text'
import { CustomButton, Section, Wrapper } from '../../../common'

// import FaceVerificationSmiley from '../../../common/animations/FaceVerificationSmiley'

// hooks
import useOnPress from '../../../../lib/hooks/useOnPress'
import useCameraSupport from '../../../browserSupport/hooks/useCameraSupport'
import usePermissions from '../../../permissions/hooks/usePermissions'
import useDisposingState from '../hooks/useDisposingState'

// utils
import UserStorage from '../../../../lib/userStorage/UserStorage'
import logger from '../../../../lib/logger/js-logger'
import { getFirstWord } from '../../../../lib/utils/getFirstWord'
import {
  getDesignRelativeHeight,
  getDesignRelativeWidth,

  // isLargeDevice,
  isSmallDevice,
} from '../../../../lib/utils/sizes'
import { withStyles } from '../../../../lib/styles'
import { isBrowser, isEmulator, isIOSWeb, isMobileSafari } from '../../../../lib/utils/platform'
import { openLink } from '../../../../lib/utils/linking'
import Config from '../../../../config/config'
import { Permissions } from '../../../permissions/types'
import { showQueueDialog } from '../../../common/dialogs/showQueueDialog'
import { fireEvent, FV_CAMERAPERMISSION, FV_CANTACCESSCAMERA, FV_INTRO } from '../../../../lib/analytics/analytics'

// import createABTesting from '../../../../lib/hooks/useABTesting'
import useFaceTecSDK from '../hooks/useFaceTecSDK'

// assets
import wait24hourIllustration from '../../../../assets/Claim/wait24Hour.svg'
import FashionShootSVG from '../../../../assets/FaceVerification/FashionPhotoshoot.svg'
import useProfile from '../../../../lib/userStorage/useProfile'
import { GlobalTogglesContext } from '../../../../lib/contexts/togglesContext'

// Localization

const log = logger.child({ from: 'FaceVerificationIntro' })

// const { useABTesting } = createABTesting('FV_Intro_Screen')

// const commonTextStyles = {
//   textAlign: 'center',
//   color: 'primary',
//   fontSize: isLargeDevice ? 18 : 16,
//   lineHeight: 25,
// }

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

// const IntroScreenA = ({ styles, firstName, ready, onVerify, onLearnMore }) => (
//   <Wrapper>
//     <Section style={styles.topContainer} grow>
//       <View style={styles.mainContent}>
//         <Section.Title fontWeight="medium" textTransform="none" style={styles.mainTitle}>
//           {`${firstName},\nOnly a real live person\ncan claim G$’s`}
//         </Section.Title>
//         <View style={styles.illustration}>
//           <FaceVerificationSmiley />
//         </View>
//         <View>
//           <Separator width={2} />
//           <Text textAlign="center" style={styles.descriptionContainer}>
//             <Text {...commonTextStyles} fontWeight="bold">
//               {`Once in a while\n`}
//             </Text>
//             <Text {...commonTextStyles}>{`we'll need to take a short video of you\n`}</Text>
//             <Text {...commonTextStyles}>{`to prevent duplicate accounts.\n`}</Text>
//             <Text
//               {...commonTextStyles}
//               fontWeight="bold"
//               textDecorationLine="underline"
//               style={styles.descriptionUnderline}
//               onPress={onLearnMore}
//             >
//               {`Learn more`}
//             </Text>
//           </Text>
//           <Separator style={styles.bottomSeparator} width={2} />
//         </View>
//         <CustomButton style={styles.button} onPress={onVerify} disabled={!ready}>
//           OK, VERIFY ME
//         </CustomButton>
//       </View>
//     </Section>
//   </Wrapper>
// )

const IntroScreenB = ({ styles, firstName, ready, onVerify, onLearnMore }) => (
  <Wrapper>
    <Section style={styles.topContainer} grow>
      <View style={styles.mainContentB}>
        <Section.Title fontWeight="bold" textTransform="none" style={styles.mainTitleB}>
          {`${firstName},`}
          <Section.Text fontWeight="normal" textTransform="none" fontSize={24} lineHeight={30}>
            {'\nVerify you are a real\nlive person'}
          </Section.Text>
        </Section.Title>
        <Section.Text fontSize={18} lineHeight={25} letterSpacing={0.18} style={styles.mainTextB}>
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
        <View style={styles.illustrationB}>
          <FashionShootSVG />
        </View>
        <CustomButton style={[styles.button]} onPress={onVerify} disabled={!ready}>
          {t`OK, VERIFY ME`}
        </CustomButton>
      </View>
    </Section>
  </Wrapper>
)

const IntroScreen = ({ styles, screenProps }) => {
  const { fullName } = useProfile()
  const { screenState, goToRoot, navigateTo, pop, push } = screenProps
  const isValid = get(screenState, 'isValid', false)
  const { setDialogBlur } = useContext(GlobalTogglesContext)

  const navigateToHome = useCallback(() => navigateTo('Home'), [navigateTo])
  const Intro = IntroScreenB

  // const [Intro, ab] = useABTesting(IntroScreenA, IntroScreenB)

  const [disposing, checkDisposalState] = useDisposingState({
    requestOnMounted: false,
    enrollmentIdentifier: UserStorage.getFaceIdentifier(),
    onComplete: isDisposing => {
      if (!isDisposing) {
        return
      }

      showQueueDialog(WalletDeletedPopupText, setDialogBlur, {
        onDismiss: goToRoot,
        imageSource: wait24hourIllustration,
      })
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
    if (isValid) {
      pop({ isValid })
    } else {
      fireEvent(FV_INTRO)
      checkDisposalState()
    }
  }, [])

  return (
    <Intro
      styles={styles}
      firstName={getFirstWord(fullName)}
      onLearnMore={openPrivacy}
      onVerify={handleVerifyClick}
      ready={false === disposing}
    />
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
    paddingBottom: getDesignRelativeHeight(isSmallDevice ? 10 : theme.sizes.defaultDouble),
    paddingLeft: getDesignRelativeWidth(theme.sizes.default),
    paddingRight: getDesignRelativeWidth(theme.sizes.default),
    paddingTop: getDesignRelativeHeight(isSmallDevice ? 10 : theme.sizes.defaultDouble),
  },
  mainContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingLeft: getDesignRelativeWidth(theme.sizes.default * 3),
    paddingRight: getDesignRelativeWidth(theme.sizes.default * 3),
    width: '100%',
  },
  mainContentB: {
    flexGrow: 1,
    justifyContent: 'space-between',
    width: '100%',
  },
  mainTitle: {
    marginTop: getDesignRelativeHeight(isBrowser ? 30 : isSmallDevice ? 10 : theme.sizes.defaultDouble),
  },
  mainTitleB: {
    marginTop: getDesignRelativeHeight(isBrowser ? 16 : 8),
  },
  mainTextB: {
    marginTop: getDesignRelativeHeight(isSmallDevice ? 12 : theme.sizes.defaultDouble),
  },
  illustration: {
    marginTop: getDesignRelativeHeight(isSmallDevice ? 12 : theme.sizes.defaultDouble),
    marginBottom: getDesignRelativeHeight(isSmallDevice ? 12 : theme.sizes.defaultDouble),
    height: getDesignRelativeWidth(isBrowser ? 220 : 180),
    width: '100%',
    alignItems: 'center',
  },
  illustrationB: {
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
