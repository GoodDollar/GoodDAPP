// libraries
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Image, Platform, View } from 'react-native'
import { t } from '@lingui/macro'
import { useIdentityExpiryDate } from '@gooddollar/web3sdk-v2'
import moment from 'moment'

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
import BillySecurity from '../../../assets/billy-security.png'
import GDLogoSVG from '../../../assets/FaceVerification/gdlogo.svg'
import useProfile from '../../../lib/userStorage/useProfile'
import useFVLoginInfoCheck from '../standalone/hooks/useFVLoginInfoCheck'
import CheckBox from '../../common/buttons/CheckBox'
import Icon from '../../common/view/Icon'

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

const IntroReVerification = ({ styles, firstName, ready, onVerify, onLearnMore, walletAddress, lastVerified }) => {
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [goodDollarOnlyConfirmed, setGoodDollarOnlyConfirmed] = useState(false)
  const shortenedWallet = useMemo(() => shortenWalletAddress(walletAddress), [walletAddress])

  return (
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
              {t`Every so often, it’s necessary to double-check that you’re still you. You’ll go through the same verification process you went through when you first signed up for GoodDollar.`}
            </Section.Text>
            <Section.Text textAlign="left" fontSize={18} lineHeight={25} letterSpacing={0.18} style={styles.mainText}>
              {t`You’ll be able to continue once this process is complete.`}
            </Section.Text>
          </Section>
          <View style={styles.illustrationContainer}>
            <Image source={BillyVerifies} style={styles.image} />
          </View>

          {walletAddress ? (
            <View style={[styles.walletBlock, { marginTop: 16 }]}>
              <View style={styles.blockHeader}>
                <Icon name="lock" color="primary" size={14} style={styles.blockHeaderIcon} />
                <Text color="primary" textAlign="left" fontWeight="bold" fontSize={14} lineHeight={18}>
                  {t`WALLET LINKED`}
                </Text>
              </View>

              <Section.Text textAlign="left" fontSize={16} lineHeight={22} letterSpacing={0.17}>
                {t`This wallet`}
                {` (${shortenedWallet}) `}
                {t`will be linked to your verified identity.`}
              </Section.Text>

              {lastVerified ? (
                <Text
                  color="gray100Percent"
                  textAlign="left"
                  fontWeight="bold"
                  fontSize={14}
                  lineHeight={18}
                  style={styles.validUntil}
                >
                  {t`Last verified:`}
                  {` ${lastVerified}`}
                </Text>
              ) : null}
            </View>
          ) : null}

          <View style={{ marginTop: 16 }}>
            <View style={{ alignItems: 'center' }}>
              <CheckBox onClick={v => setAgeConfirmed(v)} value={ageConfirmed}>
                <Text textAlign="left">{t`I am 18+ and I’m verifying my own identity.`}</Text>
              </CheckBox>
            </View>
            <View style={{ alignItems: 'center', marginTop: 10 }}>
              <CheckBox onClick={v => setGoodDollarOnlyConfirmed(v)} value={goodDollarOnlyConfirmed}>
                <Text textAlign="left">
                  {t`I understand this verification confirms I am a unique person verified on GoodDollar, and sharing my identity or wallet with others may result in a loss of funds.`}
                </Text>
              </CheckBox>
            </View>
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
          <CustomButton
            style={[styles.button]}
            onPress={onVerify}
            disabled={!ageConfirmed || !goodDollarOnlyConfirmed}
            loading={!ready}
          >
            {t`Continue`}
          </CustomButton>
        </View>
      </Section>
    </Wrapper>
  )
}

const Intro = ({ styles, firstName, ready, onVerify, onLearnMore, authPeriod }) => {
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const connectedUntil = useMemo(() => moment().add(authPeriod, 'days').format('l'), [authPeriod])
  return (
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
          >{t`To continue, you need to prove you are a unique human.`}</Section.Text>
          <Section.Text fontSize={18} lineHeight={25} letterSpacing={0.18}>
            {t`Your image is only used to ensure you’re you and prevent duplicate accounts.`}
          </Section.Text>
          <Section.Text fontSize={18} lineHeight={25} letterSpacing={0.18}>
            {t`This wallet address will be connected to your identity until`}
            {` ${connectedUntil}. `}
            {t`If you’d prefer to verify a different wallet address, please use a different wallet.`}
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
            <View style={{ alignItems: 'center' }}>
              <CheckBox
                onClick={v => {
                  setAgeConfirmed(v)
                }}
                value={ageConfirmed}
              >
                <Text>I confirm I&apos;m over 18 years of age</Text>
              </CheckBox>
            </View>
            <CustomButton style={styles.button} onPress={onVerify} disabled={!ageConfirmed} loading={!ready}>
              {t`OK, Verify me`}
            </CustomButton>
          </View>
        </View>
      </Section>
    </Wrapper>
  )
}

const WarningBlock = ({ styles }) => (
  <View style={styles.warningBlock}>
    <View style={styles.blockHeader}>
      <Icon name="info" color="orange" size={14} style={styles.blockHeaderIcon} />
      <Text color="orange" textAlign="left" fontWeight="bold" fontSize={22} lineHeight={24}>
        {t`Don’t lose your free daily money!`}
      </Text>
    </View>

    <Section.Text color="red" textAlign="left" fontSize={16} lineHeight={22} letterSpacing={0.17}>
      {t`Only complete this verification for yourself.
If someone asks you to verify for them, ignore the request.`}
    </Section.Text>
    <Section.Text
      fontWeight="bold"
      color="red"
      fontSize={16}
      textAlign="left"
      style={styles.warningBottomText}
    >{t`You can lose the money you receive from your daily G$ claim.`}</Section.Text>
  </View>
)

const shortenWalletAddress = walletAddress =>
  walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : t`Wallet unavailable`

const IntroFVFlowOverview = ({ styles, ready, onNext, authPeriod, walletAddress }) => {
  const connectedUntil = useMemo(() => moment().add(authPeriod, 'days').format('l'), [authPeriod])
  const shortenedWallet = useMemo(() => shortenWalletAddress(walletAddress), [walletAddress])

  return (
    <Wrapper withMaxHeight={false}>
      <Section style={[styles.topContainer, styles.standaloneTopContainer]} grow>
        <View style={styles.mainContent}>
          <View style={styles.standaloneHero}>
            <GDLogoSVG width={52} height={52} />
            <Section.Title fontWeight="bold" textTransform="none" style={styles.standaloneTitle}>
              {t`Verify your unique identity.`}
            </Section.Title>
            <Section.Text
              style={(styles.standaloneSubtitle, { textAlign: 'center', paddingTop: 8 })}
              textAlign="left"
              fontSize={16}
              lineHeight={22}
              letterSpacing={0.18}
            >
              {t`Identity verification confirms you're a unique person verified on GoodDollar and enables actions like`}
            </Section.Text>
            <Section.Text style={{ fontWeight: 'bold' }}>{t`Claiming daily G$.`}</Section.Text>
          </View>

          <View style={styles.standaloneBlocks}>
            <View style={styles.walletBlock}>
              <View style={styles.blockHeader}>
                <Icon name="lock" color="primary" size={14} style={styles.blockHeaderIcon} />
                <Text color="primary" textAlign="left" fontWeight="bold" fontSize={14} lineHeight={18}>
                  {t`WALLET LINKED`}
                </Text>
              </View>

              <Section.Text textAlign="left" fontSize={16} lineHeight={22} letterSpacing={0.17}>
                {t`This wallet`}
                {` (${shortenedWallet}) `}
                {t`will be linked to your verified identity.`}
              </Section.Text>

              <Text
                color="gray100Percent"
                textAlign="left"
                fontWeight="bold"
                fontSize={14}
                lineHeight={18}
                style={styles.validUntil}
              >
                {t`Valid until:`}
                {` ${connectedUntil}`}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.infoIconBadge, styles.infoIconBadgeGreen]}>
                <Icon name="privacy" color="green" size={14} />
              </View>
              <View style={styles.infoTextWrapper}>
                <Text textAlign="left" fontWeight="bold" fontSize={22} lineHeight={24}>
                  {t`Privacy Protected`}
                </Text>
                <Section.Text
                  textAlign="left"
                  fontSize={16}
                  lineHeight={22}
                  letterSpacing={0.17}
                  style={{ paddingTop: 8 }}
                >
                  {t`Your photo is used only to verify that you're a unique person. It is not used to identify you personally and is never public.`}
                </Section.Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.infoIconBadge, styles.infoIconBadgeBlue]}>
                <Icon name="profile" color="primary" size={14} />
              </View>
              <View style={styles.infoTextWrapper}>
                <Text textAlign="left" fontWeight="bold" fontSize={22} lineHeight={24}>
                  {t`Periodic verification`}
                </Text>
                <Section.Text
                  textAlign="left"
                  fontSize={16}
                  lineHeight={22}
                  letterSpacing={0.17}
                  style={{ paddingTop: 8 }}
                >
                  {t`Verification is required from time to time to maintain your verified status and prevent fraud.`}
                </Section.Text>
              </View>
            </View>

            <WarningBlock styles={styles} />
          </View>

          <CustomButton style={styles.button} onPress={onNext} disabled={!ready}>
            {t`Get Started`}
          </CustomButton>
        </View>
      </Section>
    </Wrapper>
  )
}

const IntroFVFlowAction = ({ styles, firstName, isReverify, ready, onVerify, onLearnMore, walletAddress, lastVerified }) => {
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [goodDollarOnlyConfirmed, setGoodDollarOnlyConfirmed] = useState(false)
  const shortenedWallet = useMemo(() => shortenWalletAddress(walletAddress), [walletAddress])

  return (
    <Wrapper withMaxHeight={false}>
      <Section style={[styles.topContainer, styles.standaloneTopContainer]} grow>
        <View style={styles.mainContent}>
          <View style={styles.standaloneHero}>
            <GDLogoSVG width={52} height={52} />
            {isReverify ? (
              <>
                <Section.Title fontWeight="bold" textTransform="none" style={styles.mainTitle}>
                  {firstName ? `${firstName},` : ``}
                  <Section.Text fontWeight="bold" textTransform="none" color="#00AEFF" fontSize={30} lineHeight={30}>
                    {firstName ? `\n` : ''}
                    {t`Quick identity check-in.`}
                    {`\n`}
                  </Section.Text>
                </Section.Title>
                <Section style={styles.mainText}>
                  <Section.Text textAlign="center" fontSize={18} lineHeight={25} letterSpacing={0.18}>
                    {t`Every so often, it's necessary to double-check that you're still you.`}
                  </Section.Text>
                </Section>
              </>
            ) : (
              <>
                <Section.Title fontWeight="bold" textTransform="none" style={styles.standaloneTitle}>
                  {t`Verify your unique identity.`}
                </Section.Title>
                <Section.Text
                  style={[styles.standaloneSubtitle, styles.reverifySubtitle]}
                  textAlign="left"
                  fontSize={16}
                  lineHeight={22}
                  letterSpacing={0.18}
                >
                  {t`Identity verification confirms you're a unique person verified on GoodDollar and enables actions like claiming daily G$.`}
                </Section.Text>
              </>
            )}
          </View>
          <View style={styles.standaloneIllustrationContainer}>
            <Image
              source={isReverify ? BillySecurity : BillyVerifies}
              style={isReverify ? styles.standaloneSecurityImage : styles.standaloneVerifyImage}
            />
          </View>

          <View style={styles.standaloneBlocks}>
            {isReverify && walletAddress ? (
              <View style={styles.walletBlock}>
                <View style={styles.blockHeader}>
                  <Icon name="lock" color="primary" size={14} style={styles.blockHeaderIcon} />
                  <Text color="primary" textAlign="left" fontWeight="bold" fontSize={14} lineHeight={18}>
                    {t`WALLET LINKED`}
                  </Text>
                </View>

                <Section.Text textAlign="left" fontSize={16} lineHeight={22} letterSpacing={0.17}>
                  {t`This wallet`}
                  {` (${shortenedWallet}) `}
                  {t`will be linked to your verified identity.`}
                </Section.Text>

                {lastVerified ? (
                  <Text
                    color="gray100Percent"
                    textAlign="left"
                    fontWeight="bold"
                    fontSize={14}
                    lineHeight={18}
                    style={styles.validUntil}
                  >
                    {t`Last verified:`}
                    {` ${lastVerified}`}
                  </Text>
                ) : null}
              </View>
            ) : null}
            <WarningBlock styles={styles} />
          </View>

          <View style={styles.standaloneConsentWrapper}>
            <CheckBox onClick={v => setAgeConfirmed(v)} value={ageConfirmed}>
              <Text textAlign="left" style={styles.standaloneConsentText}>
                {t`I am 18+ and I'm verifying my own identity.`}
              </Text>
            </CheckBox>

            <View style={styles.standaloneConsentSpace} />

            <CheckBox onClick={v => setGoodDollarOnlyConfirmed(v)} value={goodDollarOnlyConfirmed}>
              <Text textAlign="left" style={styles.standaloneConsentText}>
                {t`I understand this verification confirms I am a unique person verified on GoodDollar, and sharing my identity or wallet with others may result in a loss of funds.`}
              </Text>
            </CheckBox>

            <CustomButton
              style={styles.button}
              onPress={onVerify}
              disabled={!ageConfirmed || !goodDollarOnlyConfirmed}
              loading={!ready}
            >
              {t`Verify Me`}
            </CustomButton>

            <Text
              color="gray100Percent"
              fontWeight="bold"
              fontSize={16}
              lineHeight={20}
              style={styles.howItWorks}
              onPress={onLearnMore}
            >
              {t`How verification works`}
            </Text>
          </View>
        </View>
      </Section>
    </Wrapper>
  )
}

const IntroFVFlow = ({
  styles,
  firstName,
  isReverify,
  ready,
  onVerify,
  onLearnMore,
  authPeriod,
  walletAddress,
  lastVerified,
}) => {
  const [showActionScreen, setShowActionScreen] = useState(isReverify)

  if (!showActionScreen) {
    return (
      <IntroFVFlowOverview
        styles={styles}
        ready={ready}
        onNext={() => setShowActionScreen(true)}
        authPeriod={authPeriod}
        walletAddress={walletAddress}
      />
    )
  }

  return (
    <IntroFVFlowAction
      styles={styles}
      firstName={firstName}
      isReverify={isReverify}
      ready={ready}
      onVerify={onVerify}
      onLearnMore={onLearnMore}
      walletAddress={walletAddress}
      lastVerified={lastVerified}
    />
  )
}

const IntroScreen = ({ styles, screenProps, navigation }) => {
  const { fullName } = useProfile()
  const { showDialog } = useDialog()

  const { account: externalAccount, isDelta, firstName, isFVFlow, isFVFlowReady } = useContext(FVFlowContext)
  const goodWallet = useWallet()
  const { account } = goodWallet ?? {}
  const [expiryDate, , state] = useIdentityExpiryDate(externalAccount || account)
  const isReverify = expiryDate?.lastAuthenticated?.isZero() === false
  const authPeriod = expiryDate?.authPeriod?.toNumber() || 360
  const lastVerified = useMemo(() => {
    const ts = expiryDate?.lastAuthenticated
    return ts && !ts.isZero() ? moment.unix(ts.toNumber()).format('l') : null
  }, [expiryDate?.lastAuthenticated])

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

  if (isFVFlow) {
    return (
      <IntroFVFlow
        styles={styles}
        firstName={userName}
        isReverify={isReverify}
        onLearnMore={openPrivacy}
        onVerify={handleVerifyClick}
        ready={false === disposing}
        authPeriod={authPeriod}
        walletAddress={externalAccount || account}
        lastVerified={lastVerified}
      />
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
        walletAddress={account}
        lastVerified={lastVerified}
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
      authPeriod={authPeriod}
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
    paddingHorizontal: Platform.select({
      web: !isMediumDevice ? 8 : 0,
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
    marginRight: 'auto',
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
  standaloneTitle: {
    marginTop: getDesignRelativeHeight(isBrowser ? 6 : 2),
    fontSize: 28,
    lineHeight: 32,
  },
  standaloneSubtitle: {
    marginTop: getDesignRelativeHeight(4),
  },
  reverifySubtitle: {
    paddingTop: 8,
  },
  standaloneTopContainer: {
    justifyContent: 'flex-start',
  },
  standaloneHero: {
    justifyContent: 'center',
    marginBottom: getDesignRelativeHeight(6),
    alignItems: 'center',
  },
  standaloneLogo: {
    marginBottom: getDesignRelativeHeight(8),
  },
  standaloneBlocks: {
    marginTop: getDesignRelativeHeight(10),
    paddingBottom: getDesignRelativeHeight(12),
    borderBottomColor: '#E8EEF5',
    borderBottomWidth: 1,
  },
  walletBlock: {
    backgroundColor: '#ECF2FA',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D9E5F2',
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  blockHeaderIcon: {
    marginRight: 8,
  },
  validUntil: {
    marginTop: 8,
  },
  infoRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFD',
    borderRadius: 10,
    padding: 12,
  },
  infoIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  infoIconBadgeGreen: {
    backgroundColor: '#DDF6EC',
  },
  infoIconBadgeBlue: {
    backgroundColor: '#E5F1FF',
  },
  infoTextWrapper: {
    flex: 1,
  },
  warningBlock: {
    marginTop: 16,
    backgroundColor: '#FCEDED',
    borderRadius: 12,
    padding: 14,
    borderLeftColor: '#F8AF40',
    borderLeftWidth: 3,
  },
  warningBottomText: {
    marginTop: 8,
  },
  reportLink: {
    marginTop: 10,
  },
  standaloneConsentWrapper: {
    marginTop: 16,
    paddingTop: 8,
  },
  standaloneConsentText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.18,
  },
  standaloneConsentSpace: {
    height: 10,
  },
  howItWorks: {
    marginTop: 12,
  },
  standaloneIllustrationContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: getDesignRelativeHeight(8),
    marginBottom: getDesignRelativeHeight(6),
  },
  standaloneVerifyImage: {
    ...Platform.select({
      web: { width: !isMediumDevice ? 160 : 140, height: !isMediumDevice ? 160 : 140 },
      default: { width: 140, height: 140 },
    }),
    resizeMode: 'contain',
  },
  standaloneSecurityImage: {
    ...Platform.select({
      web: { width: !isMediumDevice ? 260 : 220, height: !isMediumDevice ? 160 : 140 },
      default: { width: 220, height: 140 },
    }),
    resizeMode: 'contain',
  },
})

export default withStyles(getStylesFromProps)(IntroScreen)
