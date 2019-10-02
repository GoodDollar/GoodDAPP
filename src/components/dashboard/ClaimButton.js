import React from 'react'
import { View } from 'react-native'
import { withStyles } from '../../lib/styles'
import { weiToGd } from '../../lib/wallet/utils'
import { CustomButton } from '../common'
import BigGoodDollar from '../common/view/BigGoodDollar'
import Text from '../common/view/Text'
import Section from '../common/layout/Section'

const ButtonAmountToClaim = ({ entitlement, styles }) => (
  <>
    <Text color="surface" fontWeight="medium">
      {`CLAIM YOUR SHARE - `}
    </Text>
    <BigGoodDollar
      number={entitlement}
      formatter={weiToGd}
      fontFamily="Roboto"
      bigNumberProps={{ fontFamily: 'Roboto', fontSize: 16, color: 'surface', fontWeight: 'medium', lineHeight: 24 }}
      bigNumberUnitProps={{
        fontFamily: 'Roboto',
        fontSize: 10,
        color: 'surface',
        fontWeight: 'medium',
        lineHeight: 24,
      }}
      style={styles.amountInButton}
    />
  </>
)

export const ButtonCountdown = ({ styles, nextClaim }) => (
  <View style={styles.countdownContainer}>
    <Text style={styles.extraInfoCountdownTitle}>Next Daily Income:</Text>
    <Section.Row grow>
      {nextClaim &&
        nextClaim.split('').map((value, index) => {
          return (
            <Section.Text
              key={index}
              style={styles.countdown}
              color="surface"
              fontFamily="slab"
              fontSize={36}
              fontWeight="bold"
            >
              {value}
            </Section.Text>
          )
        })}
    </Section.Row>
  </View>
)

const ButtonContent = ({ isCitizen, entitlement, nextClaim, styles }) => {
  if (isCitizen) {
    return entitlement ? (
      <ButtonAmountToClaim styles={styles} entitlement={entitlement} />
    ) : (
      <ButtonCountdown styles={styles} nextClaim={nextClaim} />
    )
  }
  return <ButtonAmountToClaim styles={styles} entitlement={entitlement} />
}

const ClaimButton = ({ isCitizen, entitlement, nextClaim, loading, onPress, styles, style }) => (
  <CustomButton
    compact={true}
    disabled={entitlement <= 0}
    loading={loading}
    mode="contained"
    onPress={onPress}
    style={[isCitizen ? styles.citizenButton : {}, isCitizen && !entitlement ? styles.buttonCountdown : {}, style]}
  >
    <ButtonContent isCitizen={isCitizen} entitlement={entitlement} nextClaim={nextClaim} styles={styles} />
  </CustomButton>
)

const getStylesFromProps = ({ theme }) => ({
  citizenButton: {
    height: 68,
  },
  buttonCountdown: {
    backgroundColor: theme.colors.orange,
    flexDirection: 'column',
  },
  countdownContainer: {
    flexDirection: 'column',
  },
  countdown: {
    display: 'flex',
    width: 20,
    justifyContent: 'center',
    marginTop: -theme.sizes.defaultHalf,
  },
  extraInfoCountdownTitle: {
    marginBottom: theme.sizes.default,
  },
  amountInButton: {
    display: 'inline',
    marginLeft: theme.sizes.defaultHalf,
  },
})
export default withStyles(getStylesFromProps)(ClaimButton)
