import React, { memo, useCallback, useEffect, useRef } from 'react'
import { View } from 'react-native'
import CardFlip from 'react-native-card-flip'
import { noop } from 'lodash'

import { CustomButton } from '../common'
import Section from '../common/layout/Section'
import Text from '../common/view/Text'
import BigGoodDollar from '../common/view/BigGoodDollar'

import { withStyles } from '../../lib/styles'
import { weiToGd } from '../../lib/wallet/utils'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../lib/utils/sizes'
import { isSmallDevice } from '../../lib/utils/mobileSizeDetect'

const buttonLabelFontSize = isSmallDevice ? 28 : 34
const timerFontSize = isSmallDevice ? 24 : 30

const ButtonAmountToClaim = ({ showLabelOnly = false, entitlement, isCitizen, styles, isInQueue }) => (
  <View style={styles.textBtn}>
    {showLabelOnly ? (
      isInQueue ? (
        <Text
          style={{ letterSpacing: 0.28 }}
          color="white"
          fontFamily="Roboto Slab"
          fontWeight="bold"
          fontSize={buttonLabelFontSize}
          textAlign="center"
        >
          In Queue
        </Text>
      ) : (
        <Text
          style={{ letterSpacing: 0.28 }}
          color="white"
          fontFamily="Roboto Slab"
          fontWeight="bold"
          fontSize={buttonLabelFontSize}
          textAlign="center"
        >
          CLAIM <br />
          NOW
        </Text>
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
    {isSmallDevice ? (
      <View style={styles.btnTitleSmallDev}>
        <Text style={styles.extraInfoCountdownTitle} textTransform={'capitalize'} fontWeight="bold" fontSize={12}>
          {`Your Next`}
        </Text>
        <Text style={styles.extraInfoCountdownTitle} textTransform={'capitalize'} fontWeight="bold" fontSize={12}>
          {`Claim:`}
        </Text>
      </View>
    ) : (
      <Text style={styles.extraInfoCountdownTitle} textTransform={'capitalize'} fontWeight="bold" fontSize={14}>
        Your Next Claim:
      </Text>
    )}
    {/* for some reason passing styles.countDownTimer doesnt work */}
    <Section.Row grow style={styles.countDownTimer}>
      {nextClaim &&
        nextClaim.split('').map((value, index) => {
          return (
            <Text
              key={index}
              fontSize={timerFontSize}
              fontFamily="Roboto Slab"
              fontWeight="bold"
              style={[styles.countdown, ~[2, 5].indexOf(index) && styles.tallCountDown]}
              lineHeight={40}
              textAlign={'center'}
            >
              {value}
            </Text>
          )
        })}
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

  const flipPerspective = isMobileNative ? noop() : 0

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

    boxShadow: 'none',
    alignItems: 'center',
  },
  buttonCountdown: {
    backgroundColor: theme.colors.orange,
    flexDirection: 'column',
  },
  countDownTimer: {
    justifyContent: 'center',

    // minHeight: isSmallDevice ? 0 : 53,
    alignItems: isSmallDevice ? 'normal' : 'center',
    color: theme.colors.darkBlue,
  },
  countdownContainer: isSmallDevice
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
    marginTop: 20,
    marginBottom: 10,
  },
  tallCountDown: {
    width: isSmallDevice ? getDesignRelativeWidth(8) : getDesignRelativeWidth(10),
  },
  countdown: {
    letterSpacing: 0.9,
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
