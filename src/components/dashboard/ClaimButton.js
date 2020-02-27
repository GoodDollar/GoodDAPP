import React from 'react'
import { Platform, View } from 'react-native'
import { withStyles } from '../../lib/styles'
import { weiToGd } from '../../lib/wallet/utils'
import { CustomButton } from '../common'
import BigGoodDollar from '../common/view/BigGoodDollar'
import Text from '../common/view/Text'
import { getDesignRelativeWidth } from '../../lib/utils/sizes'
import Section from '../common/layout/Section'

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
              //fontFamily="RobotoSlab"
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

export default withStyles(getStylesFromProps)(ClaimButton)
