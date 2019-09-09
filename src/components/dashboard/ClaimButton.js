import React from 'react'
import { View } from 'react-native'
import { withStyles } from '../../lib/styles'
import { weiToGd } from '../../lib/wallet/utils'
import { CustomButton } from '../common'
import BigGoodDollar from '../common/view/BigGoodDollar'
import Text from '../common/view/Text'

const ButtonAmountToClaim = ({ entitlement, styles }) => (
  <>
    <Text color="surface" fontWeight="medium">
      {`CLAIM YOUR SHARE - `}
    </Text>
    <BigGoodDollar
      number={entitlement}
      formatter={weiToGd}
      bigNumberProps={{ fontSize: 16, color: 'surface', fontWeight: 'medium' }}
      bigNumberUnitProps={{ fontSize: 10, color: 'surface', fontWeight: 'medium' }}
      style={styles.amountInButton}
    />
  </>
)

const ButtonCountdown = ({ styles, nextClaim }) => (
  <View style={styles.countdownContainer}>
    <Text style={styles.extraInfoCountdownTitle}>Next Daily Income:</Text>
    <Text style={styles.countdown} color="surface" fontFamily="slab" fontSize={36} fontWeight="bold">
      {nextClaim}
    </Text>
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

const ClaimButton = ({ isCitizen, entitlement, nextClaim, loading, onPress, styles }) => (
  <CustomButton
    compact={true}
    disabled={entitlement <= 0}
    loading={loading}
    mode="contained"
    onPress={onPress}
    style={[isCitizen ? styles.citizenButton : {}, isCitizen && !entitlement ? styles.buttonCountdown : {}]}
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
    marginTop: -theme.sizes.defaultHalf,
  },
  extraInfoCountdownTitle: {
    marginBottom: theme.sizes.default,
  },
  amountInButton: {
    display: 'inline',
    marginLeft: theme.sizes.defaultHalf,
    lineHeight: theme.sizes.default * 3,
  },
})

export default withStyles(getStylesFromProps)(ClaimButton)
