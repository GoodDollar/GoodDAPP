import React from 'react'
import { View } from 'react-native'

// import logger from '../../lib/logger/js-logger'
import { withStyles } from '../../../lib/styles'
import { getShadowStyles } from '../../../lib/utils/getStyles'
import CustomButton from '../../common/buttons/CustomButton'
import Wrapper from '../../common/layout/Wrapper'
import Text from '../../common/view/Text'

import {
  getDesignRelativeHeight,
  getDesignRelativeWidth,
  isShortDevice,
  isVeryShortDevice,
} from '../../../lib/utils/sizes'
import { isBrowser } from '../../../lib/utils/platform'
import NavBar from '../../appNavigation/NavBar'
import Illustration from '../../../assets/Auth/torusIllustration.svg'
import AuthProgressBar from './AuthProgressBar'

// const log = logger.child({ from: 'Welcome' })

const GetStarted = ({ theme, styles, screenProps, navigation }) => (
  <Wrapper backgroundColor={theme.colors.white} style={styles.mainWrapper}>
    <NavBar logo />
    <AuthProgressBar />
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
        Get started
      </Text>
      <Text
        color={'darkIndigo'}
        fontSize={getDesignRelativeHeight(26)}
        lineHeight={getDesignRelativeHeight(34)}
        letterSpacing={0.26}
        fontFamily="Roboto"
        fontWeight="bold"
        style={{ marginTop: getDesignRelativeHeight(14) }}
      >
        Welcome to GoodDollar
      </Text>
      <Text
        color={'darkIndigo'}
        fontSize={getDesignRelativeHeight(18)}
        lineHeight={getDesignRelativeHeight(23)}
        letterSpacing={0.26}
        fontFamily="Roboto"
        style={{ marginTop: getDesignRelativeHeight(1) }}
      >
        {`We use crypto to deliver basic income\n for the benefit of the world.`}
      </Text>
      <Text
        color={'primary'}
        fontSize={getDesignRelativeHeight(16)}
        lineHeight={getDesignRelativeHeight(16)}
        letterSpacing={0.26}
        fontFamily="Roboto"
        fontWeight="bold"
        textDecorationLine="underline"
        style={{ marginTop: getDesignRelativeHeight(12) }}
      >
        Learn More
      </Text>
      <View style={styles.illustration}>
        <Illustration
          width={getDesignRelativeWidth(isBrowser ? 331 : 276, false)}
          height={getDesignRelativeHeight(217, false)}
          viewBox="0 0 248.327 194.594"
        />
      </View>
      <View style={{ alignItems: 'center' }}>
        <CustomButton
          color={'primary'}
          style={styles.buttonLayout}
          textStyle={styles.buttonText}
          onPress={() => navigation.navigate('Auth')}
        >
          Get Started
        </CustomButton>
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
    buttonLayout: {
      marginBottom: theme.sizes.default * (isShortDevice ? 1 : 5),
      ...getShadowStyles('none', { elevation: 0 }),
      minHeight: 40,
      height: isShortDevice ? 40 : 44,
      width: '100%',
      maxWidth: 384,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '700',
    },
    illustration: {
      flex: 1,
      marginTop: getDesignRelativeHeight(theme.sizes.default * 7, false),
      alignSelf: 'center',
    },
  }
}

const GetStartedScreen = withStyles(getStylesFromProps)(GetStarted)

GetStartedScreen.navigationOptions = {
  title: 'Welcome to GoodDollar!',
  navigationBarHidden: true,
}

export default GetStartedScreen
