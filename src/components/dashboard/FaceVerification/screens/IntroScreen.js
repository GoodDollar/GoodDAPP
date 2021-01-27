// libraries
import React, { useCallback, useEffect } from 'react'
import { Platform, View } from 'react-native'
import { get } from 'lodash'

//components
import Separator from '../../../common/layout/Separator'
import Text from '../../../common/view/Text'
import { CustomButton, Section, Wrapper } from '../../../common'
import FaceVerificationSmiley from '../../../common/animations/FaceVerificationSmiley'

// hooks
import useOnPress from '../../../../lib/hooks/useOnPress'
import useCameraSupport from '../../../browserSupport/hooks/useCameraSupport'
import usePermissions from '../../../permissions/hooks/usePermissions'
import useDisposingState from '../hooks/useDisposingState'

// utils
import UserStorage from '../../../../lib/gundb/UserStorage'
import GDStore from '../../../../lib/undux/GDStore'
import logger from '../../../../lib/logger/pino-logger'
import { getFirstWord } from '../../../../lib/utils/getFirstWord'
import { getDesignRelativeHeight, getDesignRelativeWidth, isLargeDevice } from '../../../../lib/utils/sizes'
import { withStyles } from '../../../../lib/styles'
import { isBrowser, isE2ERunning, isIOSWeb, isMobileSafari } from '../../../../lib/utils/platform'
import { openLink } from '../../../../lib/utils/linking'
import Config from '../../../../config/config'
import { Permissions } from '../../../permissions/types'
import { showQueueDialog } from '../../../common/dialogs/showQueueDialog'
import { fireEvent, FV_CAMERAPERMISSION, FV_CANTACCESSCAMERA, FV_INTRO } from '../../../../lib/analytics/analytics'
import { AB } from '../utils/random'

// assets
import wait24hourIllustration from '../../../../assets/Claim/wait24Hour.svg'
import FashionShootSVG from '../../../../assets/FaceVerification/FashionPhotoshoot.svg'

const log = logger.child({ from: 'FaceVerificationIntro' })

const WalletDeletedPopupText = ({ styles }) => (
  <View style={styles.wrapper}>
    <View style={styles.title}>
      <Text textAlign="left" fontSize={22} lineHeight={28} fontWeight="medium">
        {'New Wallet?\nYou’ll need to wait 24 hours'}
      </Text>
    </View>
    <View style={styles.paddingVertical20}>
      <Text style={styles.textStyle}>
        {
          'We see you recently deleted your wallet and have opened a new one.\nThis delay is to prevent misuse, thanks for understanding!'
        }
      </Text>
    </View>
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
        imageSource: wait24hourIllustration,
      })
    },
  })

  const openPrivacy = useOnPress(() => openLink(Config.faceVerificationPrivacyUrl), [])
  const openFaceVerification = () => screenProps.push('FaceVerification')

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

  const handleVerifyClick = useCallback(() => {
    // if cypress is running - just redirect to FR as we're skipping
    // zoom component (which requires camera access) in this case
    if (isE2ERunning) {
      openFaceVerification()
      return
    }

    checkForCameraSupport()
  }, [checkForCameraSupport])

  const commonTextStyles = {
    textAlign: 'center',
    color: 'primary',
    fontSize: isLargeDevice ? 18 : 16,
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

  const introScreenA = (
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

  const introScreenB = (
    <Wrapper>
      <Section style={styles.topContainer} grow>
        <View style={styles.mainContentB}>
          <Section.Title fontWeight="bold" textTransform="none" style={styles.mainTitleB}>
            {`${getFirstWord(fullName)},`}
            <Section.Text fontWeight="normal" textTransform="none" fontSize={24} lineHeight={30}>
              {'\nVerify you are a real\nlive person'}
            </Section.Text>
          </Section.Title>
          <Section.Text fontSize={18} lineHeight={25} letterSpacing={0.18} style={{ marginTop: '17px' }}>
            Your image is only used to prevent the creation of duplicate accounts and will never be transferred to any
            third party
          </Section.Text>
          {/* TODO: where should learn more point to? */}
          <Section.Text
            fontWeight="bold"
            fontSize={18}
            lineHeight={26}
            textDecorationLine="underline"
            style={styles.learnMore}
            onPress={openPrivacy}
          >
            Learn More
          </Section.Text>
          <View style={styles.illustrationB}>
            <FashionShootSVG />
          </View>
          <CustomButton
            style={[styles.button]}
            onPress={handleVerifyClick}
            disabled={false !== disposing}
            contentStyle={{ minHeight: '53px' }}
            textStyle={{ fontSize: '16px', lineHeight: '19px', letterSpacing: '0.49px', fontWeight: 'bold' }}
          >
            OK, VERIFY ME
          </CustomButton>
        </View>
      </Section>
    </Wrapper>
  )

  return AB === 'A' ? introScreenA : introScreenB
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
  mainContentB: {
    flexGrow: 1,
    justifyContent: 'space-between',
    width: '100%',
  },
  mainTitle: {
    marginTop: getDesignRelativeHeight(isBrowser ? 30 : 15),
  },
  mainTitleB: {
    marginTop: getDesignRelativeHeight(isBrowser ? 16 : 8),
  },
  illustration: {
    marginTop: getDesignRelativeHeight(18),
    marginBottom: getDesignRelativeHeight(18),
    height: getDesignRelativeWidth(isBrowser ? 220 : 180),
    width: '100%',
    alignItems: 'center',
  },
  illustrationB: {
    marginTop: getDesignRelativeHeight(20),
    marginBottom: getDesignRelativeHeight(31),
    height: getDesignRelativeWidth(isBrowser ? 220 : 180),
    width: '100%',
    alignItems: 'center',
  },
  descriptionContainer: {
    paddingHorizontal: getDesignRelativeHeight(theme.sizes.defaultHalf),
    paddingVertical: getDesignRelativeHeight(isBrowser ? theme.sizes.defaultDouble : 14),
  },
  descriptionUnderline: {
    display: Platform.select({ web: 'block', default: 'flex' }),
    paddingTop: getDesignRelativeHeight(isBrowser ? theme.sizes.defaultQuadruple : theme.sizes.defaultDouble),
  },
  button: {
    width: '100%',
  },
  bottomSeparator: {
    marginBottom: getDesignRelativeHeight(25),
  },
  learnMore: {
    color: theme.colors.primary,
    marginTop: getDesignRelativeHeight(20),
  },
})

export default withStyles(getStylesFromProps)(IntroScreen)
