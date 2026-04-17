// libraries
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Image, Platform, View } from 'react-native'
import { t } from '@lingui/macro'
import moment from 'moment'

// components
import Text from '../../../common/view/Text'
import { CustomButton, Section, Wrapper } from '../../../common'
import CheckBox from '../../../common/buttons/CheckBox'

// hooks
import useDisposingState from '../../hooks/useDisposingState'
import useFVLoginInfoCheck from '../hooks/useFVLoginInfoCheck'
import useFVRedirect from '../hooks/useFVRedirect'
import { useWallet } from '../../../../lib/wallet/GoodWalletProvider'
import { useDialog } from '../../../../lib/dialog/useDialog'

// utils
import logger from '../../../../lib/logger/js-logger'
import { withStyles } from '../../../../lib/styles'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../../lib/utils/sizes'
import { FVFlowContext } from '../context/FVFlowContext'

// assets
import BillyVerifies from '../../../../assets/billy-verifies.png'
import BillySecurity from '../../../../assets/billy-security.png'
import GDLogoSVG from '../../../../assets/FaceVerification/gdlogo.svg'

const log = logger.child({ from: 'StandaloneIntroScreen' })

/**
 * Warning block component for reverify users
 */
const WarningBlock = ({ styles, isReverify }) => {
  if (!isReverify) return null

  return (
    <View style={styles.warningBlock}>
      <Text fontSize={14} lineHeight={20} color="#666">
        {t`You're updating your Face Verification data`}
      </Text>
    </View>
  )
}

/**
 * Wallet deleted popup text - migrated from original IntroScreen
 */
const WalletDeletedPopupText = ({ styles }) => (
  <View style={styles.wrapper}>
    <View style={styles.title}>
      <Text textAlign="left" fontSize={22} lineHeight={28} fontWeight="medium">
        {t`New Wallet?`}
        {t`You'll need to wait 24 hours`}
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

/**
 * Shorten wallet address for display
 */
const shortenWalletAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Action screen component - handles both new users and reverify users
 */
const IntroFVFlowAction = ({
  styles,
  firstName,
  onVerify,
  isReverify,
  lastAuthenticated,
  walletAddress,
}) => {
  const [over18Checked, setOver18Checked] = useState(false)
  const [gdConsentChecked, setGdConsentChecked] = useState(false)
  const { showErrorDialog } = useDialog()

  const handleVerify = useCallback(() => {
    // For reverify users, both checkboxes are required
    if (isReverify) {
      if (!over18Checked || !gdConsentChecked) {
        showErrorDialog(t`Please confirm both checkboxes to continue`)
        return
      }
    }

    onVerify()
  }, [isReverify, over18Checked, gdConsentChecked, onVerify, showErrorDialog])

  const isButtonDisabled = isReverify ? (!over18Checked || !gdConsentChecked) : false

  return (
    <Wrapper withMaxHeight={false}>
      <Section style={styles.topContainer} grow>
        <View style={styles.mainContent}>
          <Section.Title fontWeight="bold" textTransform="none" style={styles.mainTitle}>
            {firstName ? `${firstName},` : ``}
            <Section.Text fontWeight="bold" textTransform="none" color="#00AEFF" fontSize={30} lineHeight={30}>
              {firstName ? `\n` : ''}
              {isReverify
                ? t`It's time to update\nyour Face Verification!`
                : t`Welcome to\nGoodDollar!`}
              {`\n`}
            </Section.Text>
          </Section.Title>

          <Section style={styles.mainText}>
            {isReverify ? (
              <>
                <Text textAlign="left" fontSize={18} lineHeight={25} letterSpacing={0.18}>
                  {t`Every so often, it's necessary to double-check that you're still you. You'll go through the same verification process you went through when you first signed up for GoodDollar.`}
                </Text>
                <Text textAlign="left" fontSize={18} lineHeight={25} letterSpacing={0.18} style={styles.mainText}>
                  {t`You'll be able to continue once this process is complete.`}
                </Text>
              </>
            ) : (
              <>
                <Text textAlign="left" fontSize={18} lineHeight={25} letterSpacing={0.18}>
                  {t`Before you start claiming G$ tokens, we need to verify that you're a real person.`}
                </Text>
                <Text textAlign="left" fontSize={18} lineHeight={25} letterSpacing={0.18} style={styles.mainText}>
                  {t`This quick process ensures fair distribution for everyone.`}
                </Text>
              </>
            )}
          </Section>

          {/* Reverify-only: Wallet Linked Box */}
          {isReverify && walletAddress && (
            <View style={styles.walletLinkedBox}>
              <View style={styles.walletLinkedHeader}>
                <Icon name="check" size={20} color="#00AEFF" />
                <Text fontWeight="bold" fontSize={16}>
                  {t`Wallet Linked`}
                </Text>
              </View>
              <Text fontSize={14} color="#666" style={styles.walletAddress}>
                {shortenWalletAddress(walletAddress)}
              </Text>
              {lastAuthenticated && lastAuthenticated.toNumber() > 0 && (
                <Text fontSize={14} color="#666" style={styles.lastVerified}>
                  {t`Last verified: ${moment.unix(lastAuthenticated.toNumber()).format('l')}`}
                </Text>
              )}
            </View>
          )}

          <View style={styles.illustrationContainer}>
            <Image source={isReverify ? BillySecurity : BillyVerifies} style={styles.image} />
          </View>

          {/* Reverify-only: Two checkboxes */}
          {isReverify && (
            <View style={styles.checkboxesContainer}>
              <View style={styles.checkboxRow}>
                <CheckBox
                  checked={over18Checked}
                  onChange={() => setOver18Checked(!over18Checked)}
                />
                <Text style={styles.checkboxLabel}>
                  {t`I confirm that I am over 18 years old`}
                </Text>
              </View>
              <View style={styles.checkboxRow}>
                <CheckBox
                  checked={gdConsentChecked}
                  onChange={() => setGdConsentChecked(!gdConsentChecked)}
                />
                <Text style={styles.checkboxLabel}>
                  {t`I consent to GoodDollar processing my biometric data`}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <CustomButton
              onPress={handleVerify}
              disabled={isButtonDisabled}
              style={styles.button}
              textStyle={styles.buttonText}
            >
              {isReverify ? t`Verify Me` : t`Get Started`}
            </CustomButton>
          </View>
        </View>
      </Section>
    </Wrapper>
  )
}

/**
 * Main Intro Screen component - routes based on isReverify
 */
const IntroFVFlow = ({
  styles,
  screenProps,
  navigation,
  isReverify = false,
  lastAuthenticated,
  walletAddress,
}) => {
  const { account } = useContext(FVFlowContext)
  const fvRedirect = useFVRedirect()
  const { wallet } = useWallet()

  // Gate hooks - must be present in standalone screen
  useDisposingState()
  useFVLoginInfoCheck(navigation)

  const handleVerify = useCallback(() => {
    log.info('Starting face verification', { isReverify, account })
    fvRedirect(true, 'FaceVerification')
  }, [fvRedirect, isReverify, account])

  // Skip overview for reverify users
  if (isReverify) {
    return (
      <IntroFVFlowAction
        styles={styles}
        firstName={''}
        onVerify={handleVerify}
        isReverify={true}
        lastAuthenticated={lastAuthenticated}
        walletAddress={walletAddress}
      />
    )
  }

  // New users see the action screen directly (simplified from original dual-screen flow)
  return (
    <IntroFVFlowAction
      styles={styles}
      firstName={''}
      onVerify={handleVerify}
      isReverify={false}
    />
  )
}

/**
 * Standalone IntroScreen wrapper - no isFVFlow checks needed
 */
const IntroScreen = ({ styles, screenProps, navigation }) => {
  const { isReverify, lastAuthenticated, walletAddress } = screenProps

  return (
    <IntroFVFlow
      styles={styles}
      screenProps={screenProps}
      navigation={navigation}
      isReverify={isReverify}
      lastAuthenticated={lastAuthenticated}
      walletAddress={walletAddress}
    />
  )
}

const getStylesFromProps = ({ theme }) => ({
  topContainer: {
    justifyContent: 'space-between',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: getDesignRelativeWidth(20),
    paddingTop: getDesignRelativeHeight(20),
  },
  mainTitle: {
    marginBottom: getDesignRelativeHeight(20),
  },
  mainText: {
    marginBottom: getDesignRelativeHeight(20),
  },
  illustrationContainer: {
    alignItems: 'center',
    marginVertical: getDesignRelativeHeight(20),
  },
  image: {
    width: getDesignRelativeWidth(200),
    height: getDesignRelativeHeight(200),
    resizeMode: 'contain',
  },
  buttonContainer: {
    marginTop: getDesignRelativeHeight(20),
    marginBottom: getDesignRelativeHeight(40),
  },
  button: {
    marginTop: getDesignRelativeHeight(10),
  },
  buttonText: {
    fontSize: 18,
  },
  walletLinkedBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginVertical: getDesignRelativeHeight(16),
  },
  walletLinkedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  walletAddress: {
    marginTop: 4,
  },
  lastVerified: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  checkboxesContainer: {
    marginVertical: getDesignRelativeHeight(16),
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getDesignRelativeHeight(12),
  },
  checkboxLabel: {
    marginLeft: 12,
    fontSize: 14,
    flex: 1,
  },
  warningBlock: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 12,
    marginVertical: getDesignRelativeHeight(12),
  },
  wrapper: {
    padding: 20,
  },
  title: {
    marginBottom: 16,
  },
  paddingVertical20: {
    paddingVertical: 20,
  },
  textStyle: {
    fontSize: 14,
    lineHeight: 20,
  },
})

export default withStyles(IntroScreen, getStylesFromProps)
