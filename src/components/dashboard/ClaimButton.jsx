import React, { memo, useCallback, useEffect, useRef } from 'react'
import { ActivityIndicator, View } from 'react-native'
import CardFlip from 'react-native-card-flip'

import { noop } from 'lodash'
import { t } from '@lingui/macro'
import { CustomButton } from '../common'
import Section from '../common/layout/Section'
import Text from '../common/view/Text'
import BigGoodDollar from '../common/view/BigGoodDollar'

import { withStyles } from '../../lib/styles'
import { getDesignRelativeHeight, getDesignRelativeWidth, isSmallDevice } from '../../lib/utils/sizes'
import { theme } from '../theme/styles'

import Config from '../../config/config'
import { isMobileNative } from '../../lib/utils/platform'

const { disableClaim } = Config
const flipPerspective = isMobileNative ? undefined : CardFlip.defaultProps.perspective

const ButtonAmountToClaim = ({ showLabelOnly = false, entitlement, isCitizen, styles, isInQueue }) => (
  <View>
    {showLabelOnly ? (
      isInQueue ? (
        <Text
          style={{ letterSpacing: 0.28 }}
          color="white"
          fontFamily={theme.fonts.slab}
          fontWeight="bold"
          fontSize={28}
          textAlign="center"
        >
          {t`In Queue`}
        </Text>
      ) : (
        <>
          <Text
            style={{ letterSpacing: 0.28 }}
            color="white"
            fontFamily={theme.fonts.slab}
            fontWeight="bold"
            fontSize={28}
            textAlign="center"
          >
            {t`CLAIM`}
          </Text>
          <Text
            style={{ letterSpacing: 0.28 }}
            color="white"
            fontFamily={theme.fonts.slab}
            fontWeight="bold"
            fontSize={28}
            textAlign="center"
          >
            {t`NOW`}
          </Text>
        </>
      )
    ) : (
      <>
        <Text color="#0C263D" fontWeight="medium">
          {t`Get your `}
        </Text>
        <Text color="#0C263D" fontWeight="medium">
          {t` free daily share:`}
        </Text>
        <BigGoodDollar
          number={entitlement}
          fontFamily="Roboto"
          bigNumberProps={{
            fontFamily: 'Roboto',
            fontSize: 36,
            color: 'surface',
            fontWeight: 'bold',
            lineHeight: 36,
          }}
          bigNumberUnitProps={{
            fontFamily: 'Roboto',
            fontSize: 16,
            color: 'surface',
            fontWeight: 'medium',
            lineHeight: 20,
          }}
          style={isCitizen ? styles.amountInButtonCenter : styles.amountInButton}
        />
      </>
    )}
  </View>
)

const ButtonDisabled = ({ styles }) => (
  <View>
    <>
      <Text
        style={{ letterSpacing: 0.28 }}
        color="white"
        fontFamily={theme.fonts.slab}
        fontWeight="bold"
        fontSize={28}
        textAlign="center"
      >
        Be Back
      </Text>
      <Text
        style={{ letterSpacing: 0.28 }}
        color="white"
        fontFamily={theme.fonts.slab}
        fontWeight="bold"
        fontSize={28}
        textAlign="center"
      >
        SOON
      </Text>
    </>
  </View>
)

export const ButtonCountdown = ({ styles, nextClaim }) => (
  <View style={styles.countdownContainer}>
    <Text
      style={styles.extraInfoCountdownTitle}
      textTransform={'capitalize'}
      fontWeight="bold"
      lineHeight={17}
      fontSize={14}
    >
      {t`Your Next Claim:`}
    </Text>
    {/* for some reason passing styles.countDownTimer doesnt work */}
    <Section.Row style={styles.countDownTimer}>
      {nextClaim !== '00:00:00' ? (
        nextClaim.split('').map((value, index) => (
          <Text
            key={index}
            fontSize={30}
            fontFamily={theme.fonts.slab}
            fontWeight="bold"
            style={[styles.countdown, value === ':' ? styles.tallCountDown : null]}
            lineHeight={40}
            textAlign={'center'}
          >
            {value}
          </Text>
        ))
      ) : (
        <ActivityIndicator style={{ marginTop: 5 }} size="large" />

        // <></>
      )}
    </Section.Row>
  </View>
)

const ButtonContent = ({ isCitizen, entitlement, nextClaim, styles, showLabelOnly, isInQueue }) => {
  // if user can claim either as whitelisted or new user not whitelisted show claim
  // otherwise show countdown
  if (entitlement) {
    return (
      <ButtonAmountToClaim
        styles={styles}
        entitlement={entitlement}
        isCitizen={isCitizen}
        showLabelOnly={showLabelOnly}
        isInQueue={isInQueue}
      />
    )
  }
  return <ButtonCountdown styles={styles} nextClaim={nextClaim} />
}

const ClaimButton = ({ isCitizen, entitlement, nextClaim, onPress, styles, style, showLabelOnly, isInQueue }) => (
  <CustomButton
    testId="claim_button"
    compact={true}
    mode="contained"
    onPress={disableClaim ? noop : onPress}
    style={[styles.minButtonHeight, (isCitizen && !entitlement) || isInQueue ? styles.buttonCountdown : {}, style]}
  >
    {disableClaim ? (
      <ButtonDisabled styles={styles} />
    ) : (
      <ButtonContent
        isCitizen={isCitizen}
        showLabelOnly={showLabelOnly}
        entitlement={entitlement}
        nextClaim={nextClaim}
        styles={styles}
        isInQueue={isInQueue}
      />
    )}
  </CustomButton>
)

const ClaimAnimationButton = memo(({ styles, entitlement, nextClaim, onPress, isInQueue, ...buttonProps }) => {
  const cardRef = useRef()
  const setCardRef = useCallback(ref => (cardRef.current = ref), [])

  const nextClaimOnHold = useRef(null)
  const suspendRendering = useCallback(() => (nextClaimOnHold.current = nextClaim), [nextClaim])
  const restoreRendering = useCallback(() => (nextClaimOnHold.current = null), [])

  useEffect(() => {
    const card = cardRef.current

    if (card && entitlement && !card.entitlement) {
      card.flip()
      card.entitlement = entitlement
    }
  }, [entitlement])

  const nextClaimToDisplay = nextClaimOnHold.current || nextClaim

  const onButtonPress = useCallback(
    event => {
      if (!entitlement) {
        return
      }

      return onPress(event)
    },
    [entitlement, onPress],
  )

  return (
    <CardFlip
      style={styles.cardContainer}
      ref={setCardRef}
      flipDirection="x"
      duration={1000}
      flipZoom={0}
      perspective={flipPerspective}
      onFlipStart={suspendRendering}
      onFlipEnd={restoreRendering}
    >
      <ClaimButton
        {...buttonProps}
        styles={styles}
        entitlement={0}
        isCitizen={true}
        nextClaim={nextClaimToDisplay}
        isInQueue={isInQueue}
      />
      <ClaimButton
        {...buttonProps}
        styles={styles}
        entitlement={entitlement}
        nextClaim={nextClaimToDisplay}
        onPress={onButtonPress}
        isInQueue={isInQueue}
      />
    </CardFlip>
  )
})
const getStylesFromProps = ({ theme }) => ({
  cardContainer: {
    alignItems: 'center',
    width: isSmallDevice ? 140 : getDesignRelativeHeight(166),
    height: isSmallDevice ? 140 : getDesignRelativeHeight(166),
  },
  minButtonHeight: {
    backgroundColor: theme.colors.green,
    borderRadius: isSmallDevice ? 70 : 98,
    borderColor: '#FFFFFF',
    borderWidth: 8,
    borderStyle: 'solid',
    height: isSmallDevice ? 140 : getDesignRelativeHeight(166),
    width: isSmallDevice ? 140 : getDesignRelativeHeight(166),
    alignItems: 'center',
    elevation: 0,
    shadowRadius: 0,
  },
  buttonCountdown: {
    backgroundColor: theme.colors.orange,
    flexDirection: 'column',
  },
  countDownTimer: {
    justifyContent: 'center',

    // minHeight: isSmallDevice ? 0 : 53,
    alignItems: 'center',
  },
  countdownContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'center',
  },
  tallCountDown: {
    width: 10,
  },
  countdown: {
    letterSpacing: 0,
    width: getDesignRelativeWidth(17),
  },
  extraInfoCountdownTitle: {
    letterSpacing: 0,
    lineHeight: 17,
    color: theme.colors.darkBlue,
  },
  amountInButton: {
    display: 'flex',
  },
  amountInButtonCenter: {
    display: 'flex',
    alignItems: 'center',
  },
  textLineHeight: {
    lineHeight: 36,
  },
})

export default withStyles(getStylesFromProps)(ClaimAnimationButton)
