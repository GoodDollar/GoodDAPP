import React, { memo, useCallback, useEffect, useRef } from 'react'
import { View } from 'react-native'
import CardFlip from 'react-native-card-flip'

import { CustomButton } from '../common'
import Section from '../common/layout/Section'
import Text from '../common/view/Text'
import BigGoodDollar from '../common/view/BigGoodDollar'

import { withStyles } from '../../lib/styles'
import { weiToGd } from '../../lib/wallet/utils'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../lib/utils/sizes'

const ButtonAmountToClaim = ({ showLabelOnly = false, entitlement, isCitizen, styles }) => (
  <View style={styles.textBtn}>
    {showLabelOnly ? (
      <Text color="white" fontFamily="Roboto Slab" fontWeight="bold" fontSize={40}>
        {`Claim`}
      </Text>
    ) : (
      <>
        <Text color="#0C263D" fontWeight="medium">
          {`Get your `}
        </Text>
        <Text color="#0C263D" fontWeight="medium">
          {` free daily share:`}
        </Text>
        <BigGoodDollar
          number={entitlement}
          formatter={weiToGd}
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

export const ButtonCountdown = ({ styles, nextClaim }) => (
  <View style={styles.countdownContainer}>
    <Text style={styles.extraInfoCountdownTitle} fontWeight="bold">
      Your next daily claim:
    </Text>
    <Section.Row grow style={styles.justifyCenter}>
      {nextClaim &&
        nextClaim.split('').map((value, index) => {
          return (
            <Text
              key={index}
              fontSize={36}
              fontFamily="Roboto Slab"
              fontWeight="bold"
              color="white"
              style={[styles.countdown, ~[2, 5].indexOf(index) && styles.tallCountDown]}
            >
              {value}
            </Text>
          )
        })}
    </Section.Row>
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

const ClaimButton = ({ isCitizen, entitlement, nextClaim, onPress, styles, style }) => (
  <CustomButton
    testId="claim_button"
    compact={true}
    disabled={entitlement <= 0}
    mode="contained"
    onPress={onPress}
    style={[styles.minButtonHeight, isCitizen && !entitlement ? styles.buttonCountdown : {}, style]}
  >
    <ButtonContent isCitizen={isCitizen} entitlement={entitlement} nextClaim={nextClaim} styles={styles} />
  </CustomButton>
)

const ClaimAnimationButton = memo(({ styles, entitlement, nextClaim, onPress, ...buttonProps }) => {
  const initialEntitlementRef = useRef(entitlement)

  const cardRef = useRef()
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
  textBtn: {
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'center',
  },
  cardContainer: {
    alignItems: 'center',
    width: getDesignRelativeWidth(196),
    height: getDesignRelativeHeight(196),
  },
  minButtonHeight: {
    borderRadius: '50%',
    borderColor: '#FFFFFF',
    borderWidth: 3,
    borderStyle: 'solid',
    height: getDesignRelativeHeight(196),
    boxShadow: '10px 12px 25px -14px',
    width: getDesignRelativeWidth(196),
    alignItems: 'center',
  },
  buttonCountdown: {
    backgroundColor: theme.colors.orange,
    flexDirection: 'column',
  },
  countdownContainer: {
    flexDirection: 'column',
  },
  tallCountDown: {
    width: getDesignRelativeWidth(10),
  },
  countdown: {
    width: getDesignRelativeWidth(25),
  },
  extraInfoCountdownTitle: {
    letterSpacing: 0.08,
  },
  amountInButton: {
    display: 'flex',
  },
  amountInButtonCenter: {
    display: 'flex',
    alignItems: 'center',
  },
})

export default withStyles(getStylesFromProps)(ClaimAnimationButton)
