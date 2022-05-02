import React from 'react'
import { View } from 'react-native'

import AuthProgressBar from '../../auth/components/AuthProgressBar'
import { withStyles } from '../../../lib/styles'
import Text from '../../common/view/Text'

import { getDesignRelativeHeight, isShortDevice, isVeryShortDevice } from '../../../lib/utils/sizes'
import RocketShip from '../../common/animations/RocketShip'

const WalletPreparing = ({ theme, styles, activeStep = 1 }) => (
  <>
    <AuthProgressBar step={activeStep} done={false} />
    <View style={styles.contentContainer}>
      <Text
        color={'primary'}
        fontSize={getDesignRelativeHeight(12)}
        lineHeight={getDesignRelativeHeight(21)}
        letterSpacing={0.26}
        fontFamily="Roboto"
        fontWeight="bold"
        textTransform="uppercase"
      >
        Preparing the wallet
      </Text>
      <Text
        color={'darkIndigo'}
        fontSize={getDesignRelativeHeight(26)}
        lineHeight={getDesignRelativeHeight(34)}
        letterSpacing={0.26}
        fontFamily="Roboto"
        fontWeight="bold"
        style={{ marginTop: getDesignRelativeHeight(15) }}
      >
        {`We're Preparing\nYour Wallet`}
      </Text>
      <Text
        color={'darkIndigo'}
        fontSize={getDesignRelativeHeight(18)}
        lineHeight={getDesignRelativeHeight(23)}
        letterSpacing={0.26}
        fontFamily="Roboto"
        style={{ marginTop: getDesignRelativeHeight(14) }}
      >
        It might take a few seconds
      </Text>
      <View style={styles.illustration}>
        <RocketShip />
      </View>
    </View>
  </>
)

const getStylesFromProps = ({ theme }) => {
  return {
    contentContainer: {
      flex: 1,
      paddingBottom: isVeryShortDevice ? 20 : 0,
      paddingTop: getDesignRelativeHeight(isShortDevice ? 35 : 45),
    },
    illustration: {
      flex: 1,
      marginTop: getDesignRelativeHeight(theme.sizes.default * 7, false),
      alignSelf: 'center',
    },
  }
}

const WalletPreparingScreen = withStyles(getStylesFromProps)(WalletPreparing)

export default WalletPreparingScreen
