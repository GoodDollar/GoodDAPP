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
import { getScreenWidth } from '../../lib/utils/Orientation'

const isSmallDev = getScreenWidth() < 350

const ButtonAmountToClaim = ({ showLabelOnly = false, entitlement, isCitizen, styles }) => (
  <View style={styles.textBtn}>
    {showLabelOnly ? (
      <Text color="white" fontFamily="Roboto Slab" fontWeight="bold" fontSize={isSmallDev ? 30 : 40}>
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
    {isSmallDev ? (
      <View style={styles.btnTitleSmallDev}>
        <Text style={styles.extraInfoCountdownTitle} fontWeight="bold">
          {`Your next`}
        </Text>
        <Text style={styles.extraInfoCountdownTitle} fontWeight="bold">
          {`daily claim:`}
        </Text>
      </View>
    ) : (
      <Text style={styles.extraInfoCountdownTitle} fontWeight="bold">
        Your next daily claim:
      </Text>
    )}
    {/* for some reason passing styles.countDownTimer doesnt work */}
    <Section.Row grow style={styles.countDownTimer}>
      {nextClaim &&
        nextClaim.split('').map((value, index) => {
          return (
            <Text
              key={index}
              fontSize={isSmallDev ? 30 : 36}
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

const ButtonContent = ({ isCitizen, entitlement, nextClaim, styles, showLabelOnly }) => {
  if (entitlement || isCitizen === false) {
    return (
      <ButtonAmountToClaim
        styles={styles}
        entitlement={entitlement}
        isCitizen={isCitizen}
        showLabelOnly={showLabelOnly}
      />
    )
  }
  return <ButtonCountdown styles={styles} nextClaim={nextClaim} />
}

const ClaimButton = ({ isCitizen, entitlement, nextClaim, onPress, styles, style, showLabelOnly }) => (
  <CustomButton
    testId="claim_button"
    compact={true}
    mode="contained"
    onPress={onPress}
    style={[styles.minButtonHeight, isCitizen && !entitlement ? styles.buttonCountdown : {}, style]}
  >
    <ButtonContent
      isCitizen={isCitizen}
      showLabelOnly={showLabelOnly}
      entitlement={entitlement}
      nextClaim={nextClaim}
      styles={styles}
    />
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
    width: getDesignRelativeHeight(196),
    height: getDesignRelativeHeight(196),
  },
  minButtonHeight: {
    borderRadius: isSmallDev ? 70 : 98,
    borderColor: '#FFFFFF',
    borderWidth: 3,
    borderStyle: 'solid',
    height: isSmallDev ? 140 : 196,
    width: isSmallDev ? 140 : 196,
    boxShadow: '10px 12px 25px -14px',
    alignItems: 'center',
  },
  buttonCountdown: {
    backgroundColor: theme.colors.orange,
    flexDirection: 'column',
  },
  countDownTimer: {
    justifyContent: 'center',
    minHeight: isSmallDev ? 0 : 53,
    alignItems: isSmallDev ? 'normal' : 'center',
  },
  countdownContainer: isSmallDev
    ? {
        flexDirection: 'column',
        height: 140,
      }
    : {
        flexDirection: 'column',
        justifyContent: 'center',
        display: 'flex',
        alignItems: 'center',
      },
  btnTitleSmallDev: {
    position: 'relative',
    top: 0,
    left: 0,
    marginTop: 18,
  },
  tallCountDown: {
    width: isSmallDev ? getDesignRelativeWidth(8) : getDesignRelativeWidth(10),
  },
  countdown: {
    width: isSmallDev ? getDesignRelativeWidth(18) : getDesignRelativeWidth(25),
  },
  extraInfoCountdownTitle: {
    letterSpacing: 0.14,
    fontSize: isSmallDev ? 14 : 16,
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
