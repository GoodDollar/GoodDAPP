import React, { memo, useCallback, useEffect, useRef } from 'react'
import { Platform, View } from 'react-native'
import CardFlip from 'react-native-card-flip'

import { CustomButton } from '../common'
import Text from '../common/view/Text'
import Section from '../common/layout/Section'
import BigGoodDollar from '../common/view/BigGoodDollar'

import { weiToGd } from '../../lib/wallet/utils'
import { withStyles } from '../../lib/styles'
import { getDesignRelativeWidth } from '../../lib/utils/sizes'

const ButtonAmountToClaim = ({ entitlement, isCitizen, styles }) => (
  <View style={styles.countdownContainer}>
    <Text color="surface" fontWeight="medium">
      {`CLAIM YOUR SHARE - `}
    </Text>
    <BigGoodDollar
      number={entitlement}
      formatter={weiToGd}
      fontFamily="Roboto"
      bigNumberProps={{
        fontFamily: 'Roboto',
        fontSize: isCitizen ? 36 : 16,
        color: 'surface',
        fontWeight: 'medium',
        lineHeight: 36,
      }}
      bigNumberUnitProps={{
        fontFamily: 'Roboto',
        fontSize: isCitizen ? 16 : 10,
        color: 'surface',
        fontWeight: 'medium',
        lineHeight: 19,
        marginVertical: 'auto',
      }}
      style={isCitizen ? [styles.amountInButtonCenter, styles.justifyCenter] : styles.amountInButton}
    />
  </View>
)

export const ButtonCountdown = ({ styles, nextClaim }) => (
  <View style={styles.countdownContainer}>
    <Text style={styles.extraInfoCountdownTitle} fontWeight="bold">
      Your next daily claim:
    </Text>
    <Section.Text style={styles.textLineHeight}>
      {nextClaim &&
        nextClaim.split('').map((value, index) => {
          return (
            <Text
              key={index}
              fontSize={36}
              lineHeight={36}
              fontFamily="Roboto"
              fontWeight="bold"
              color="white"
              style={[styles.countdown, ~[2, 5].indexOf(index) && styles.tallCountDown]}
            >
              {value}
            </Text>
          )
        })}
    </Section.Text>
  </View>
)

const ButtonContent = ({ isCitizen, entitlement, nextClaim, styles }) => {
  if (isCitizen) {
    return entitlement ? (
      <ButtonAmountToClaim styles={styles} entitlement={entitlement} isCitizen={isCitizen} />
    ) : (
      <ButtonCountdown styles={styles} nextClaim={nextClaim} />
    )
  }
  return <ButtonAmountToClaim styles={styles} entitlement={entitlement} isCitizen={isCitizen} />
}

const ClaimButton = ({ isCitizen, entitlement, nextClaim, loading, onPress, styles, style }) => (
  <CustomButton
    testId="claim_button"
    compact={true}
    disabled={entitlement <= 0}
    loading={loading}
    mode="contained"
    onPress={onPress}
    style={[styles.minButtonHeight, isCitizen && !entitlement ? styles.buttonCountdown : {}, style]}
  >
    <ButtonContent isCitizen={isCitizen} entitlement={entitlement} nextClaim={nextClaim} styles={styles} />
  </CustomButton>
)

const ClaimAnimation = memo(({ styles, entitlement, nextClaim, onPress, ...buttonProps }) => {
  const initialEntitlementRef = useRef(entitlement)

  const cardRef = useRef(null)
  const setCardRef = useCallback(ref => (cardRef.current = ref), [])

  const nextClaimOnHold = useRef(null)
  const suspendRendering = useCallback(() => (nextClaimOnHold.current = nextClaim), [nextClaim])

  const restoreRendering = useCallback(() => (nextClaimOnHold.current = null), [])

  useEffect(() => {
    const card = cardRef.current

    if (card && entitlement) {
      card.flip()
    }
  }, [entitlement])

  if (initialEntitlementRef.current) {
    return (
      <ClaimButton {...buttonProps} styles={styles} entitlement={entitlement} nextClaim={nextClaim} onPress={onPress} />
    )
  }

  if (!entitlement) {
    return <ClaimButton styles={styles} {...buttonProps} nextClaim={nextClaim} />
  }

  const nextClaimToDisplay = nextClaimOnHold.current || nextClaim

  return (
    <CardFlip
      style={styles.cardContainer}
      ref={setCardRef}
      flipDirection="x"
      duration={1000}
      flipZoom={0}
      perspective={0}
      onFlipStart={suspendRendering}
      onFlipEnd={restoreRendering}
    >
      <ClaimButton {...buttonProps} styles={styles} entitlement={0} nextClaim={nextClaimToDisplay} />
      <ClaimButton
        {...buttonProps}
        styles={styles}
        entitlement={entitlement}
        nextClaim={nextClaimToDisplay}
        onPress={onPress}
      />
    </CardFlip>
  )
})

const getStylesFromProps = ({ theme }) => ({
  justifyCenter: {
    justifyContent: 'center',
  },
  minButtonHeight: {
    minHeight: 68,
    width: '100%',
  },
  buttonCountdown: {
    backgroundColor: theme.colors.orange,
    flexDirection: 'column',
  },
  countdownContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  tallCountDown: {
    width: getDesignRelativeWidth(10),
  },
  countdown: {
    width: getDesignRelativeWidth(25),
    marginTop: -theme.sizes.defaultHalf,
  },
  extraInfoCountdownTitle: {
    marginBottom: theme.sizes.default,
    letterSpacing: 0.08,
  },
  amountInButton: {
    display: Platform.select({
      // FIXME: RN
      web: 'inline',
      default: 'flex',
    }),
    marginLeft: theme.sizes.defaultHalf,
  },
  amountInButtonCenter: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: theme.sizes.defaultHalf,
  },
  textLineHeight: {
    lineHeight: 36,
  },
})

export const AnimatedClaimButton = withStyles(getStylesFromProps)(ClaimAnimation)

export default withStyles(getStylesFromProps)(ClaimButton)
