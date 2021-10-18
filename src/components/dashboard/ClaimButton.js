import React, { memo, useCallback, useEffect, useRef } from 'react'
import { View } from 'react-native'
import CardFlip from 'react-native-card-flip'

import { CustomButton } from '../common'
import Section from '../common/layout/Section'
import Text from '../common/view/Text'
import BigGoodDollar from '../common/view/BigGoodDollar'

import { withStyles } from '../../lib/styles'
import { weiToGd } from '../../lib/wallet/utils'
import { getDesignRelativeHeight, getDesignRelativeWidth, isSmallDevice } from '../../lib/utils/sizes'
import { isMobileNative } from '../../lib/utils/platform'
import { theme } from '../theme/styles'

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
          In Queue
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
            CLAIM
          </Text>
          <Text
            style={{ letterSpacing: 0.28 }}
            color="white"
            fontFamily={theme.fonts.slab}
            fontWeight="bold"
            fontSize={28}
            textAlign="center"
          >
            NOW
          </Text>
        </>
      )
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
    <Text
      style={styles.extraInfoCountdownTitle}
      textTransform={'capitalize'}
      fontWeight="bold"
      lineHeight={17}
      fontSize={14}
    >
      Your Next Claim:
    </Text>
    {/* for some reason passing styles.countDownTimer doesnt work */}
    <Section.Row style={styles.countDownTimer}>
      {nextClaim &&
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
        ))}
    </Section.Row>
  </View>
)

const ButtonContent = ({ isCitizen, entitlement, nextClaim, styles, showLabelOnly, isInQueue }) => {
  //if user can claim either as whitelisted or new user not whitelisted show claim
  //otherwise show countdown
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
    onPress={onPress}
    style={[styles.minButtonHeight, (isCitizen && !entitlement) || isInQueue ? styles.buttonCountdown : {}, style]}
  >
    <ButtonContent
      isCitizen={isCitizen}
      showLabelOnly={showLabelOnly}
      entitlement={entitlement}
      nextClaim={nextClaim}
      styles={styles}
      isInQueue={isInQueue}
    />
  </CustomButton>
)

const ClaimAnimationButton = memo(({ styles, entitlement, nextClaim, onPress, isInQueue, ...buttonProps }) => {
  //const [animEntitlement, setAnimEntitlement] = useState(0)
  const cardRef = useRef()
  const setCardRef = useCallback(ref => (cardRef.current = ref), [])

  const nextClaimOnHold = useRef(null)
  const suspendRendering = useCallback(() => (nextClaimOnHold.current = nextClaim), [nextClaim])
  const restoreRendering = useCallback(() => (nextClaimOnHold.current = null), [])

  useEffect(() => {
    const card = cardRef.current

    if (card && entitlement) {
      card.flip()

      // setAnimEntitlement(entitlement)
    }
  }, [entitlement])

  const nextClaimToDisplay = nextClaimOnHold.current || nextClaim

  const onButtonPress = useCallback(
    event => {
      if (!entitlement) {
        return
      }

      onPress(event)
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
