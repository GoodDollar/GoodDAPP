import React from 'react'
import { View } from 'react-native'
import { withStyles } from '../../lib/styles'
import { weiToGd } from '../../lib/wallet/utils'
import { CustomButton } from '../common'
import BigGoodDollar from '../common/view/BigGoodDollar'
import Text from '../common/view/Text'
import Section from '../common/layout/Section'
import { getDesignRelativeWidth } from '../../lib/utils/sizes'

const ButtonAmountToClaim = ({ entitlement, isCitizen, styles }) => (
  <>
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
      style={isCitizen ? styles.amountInButtonCenter : styles.amountInButton}
    />
  </>
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
    marginTop: -theme.sizes.defaultHalf,
  },
  extraInfoCountdownTitle: {
    marginBottom: theme.sizes.default,
  },
  amountInButton: {
    display: 'inline',
    marginLeft: theme.sizes.defaultHalf,
  },
  amountInButtonCenter: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: theme.sizes.defaultHalf,
  },
})

export default withStyles(getStylesFromProps)(ClaimButton)
