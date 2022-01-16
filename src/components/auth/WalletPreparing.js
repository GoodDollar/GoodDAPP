import React from 'react'
import { View } from 'react-native'

import { withStyles } from '../../lib/styles'
import Wrapper from '../common/layout/Wrapper'
import Text from '../common/view/Text'

import {
  getDesignRelativeHeight,
  getDesignRelativeWidth,
  isShortDevice,
  isVeryShortDevice,
} from '../../lib/utils/sizes'
import { isBrowser } from '../../lib/utils/platform'
import NavBar from '../appNavigation/NavBar'
import Illustration from '../../assets/Signup/illustration.svg'
import AuthProgressBar from './AuthProgressBar'

const WalletPreparing = ({ theme, styles, screenProps, navigation }) => (
  <Wrapper backgroundColor={theme.colors.white} style={styles.mainWrapper}>
    <NavBar logo />
    <AuthProgressBar step={3} />
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
  </Wrapper>
)

const getStylesFromProps = ({ theme }) => {
  return {
    mainWrapper: {
      paddingHorizontal: 0,
      paddingVertical: 0,
      justifyContent: 'flex-start',
    },
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

WalletPreparingScreen.navigationOptions = {
  navigationBarHidden: true,
}

export default WalletPreparingScreen
