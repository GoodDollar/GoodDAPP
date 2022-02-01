import React from 'react'
import { View } from 'react-native'

import { withStyles } from '../../../lib/styles'
import Text from '../../common/view/Text'

import {
  getDesignRelativeHeight,
  getDesignRelativeWidth,
  isShortDevice,
  isVeryShortDevice,
} from '../../../lib/utils/sizes'
import { isBrowser } from '../../../lib/utils/platform'
import Illustration from '../../../assets/Signup/illustration.svg'

const WalletPreparing = ({ theme, styles, screenProps, navigation }) => (
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
      <Illustration
        width={getDesignRelativeWidth(isBrowser ? 331 : 276, false)}
        height={getDesignRelativeHeight(177, false)}
        viewBox="0 0 311.713 223.572"
      />
    </View>
  </View>
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
