import React, { useEffect } from 'react'
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
import Illustration from '../../../assets/Auth/Illustration.svg'

import Config from '../../../config/config'
import restart from '../../../lib/utils/restart'

const { authSuccessDelay } = Config
const defaultAfterShown = () => restart('/')

const WelcomeGD = ({ theme, styles, screenProps, navigation, showDelay, afterShown }) => {
  useEffect(() => {
    const delay = showDelay || authSuccessDelay
    const callback = afterShown || defaultAfterShown
    const timeoutId = setTimeout(callback, delay)

    return () => void clearTimeout(timeoutId)
  }, [showDelay, afterShown])

  return (
    <View style={styles.contentContainer}>
      <Text
        color={'lighterGreen'}
        fontSize={getDesignRelativeHeight(12)}
        lineHeight={getDesignRelativeHeight(21)}
        letterSpacing={0.26}
        fontFamily="Roboto"
        fontWeight="bold"
        textTransform="uppercase"
      >
        {`Congrats You're Done`}
      </Text>
      <Text
        color={'darkIndigo'}
        fontSize={getDesignRelativeHeight(26)}
        lineHeight={getDesignRelativeHeight(34)}
        letterSpacing={0.26}
        fontFamily="Roboto"
        fontWeight="bold"
        style={{ marginTop: getDesignRelativeHeight(10) }}
      >
        Welcome to GoodDollar!
      </Text>
      <View style={styles.illustration}>
        <Illustration
          width={getDesignRelativeWidth(isBrowser ? 331 : 276, false)}
          height={getDesignRelativeHeight(177, false)}
          viewBox="0 0 284.793 192.715"
        />
      </View>
    </View>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    contentContainer: {
      flex: 1,
      paddingBottom: isVeryShortDevice ? 20 : 0,
      paddingTop: getDesignRelativeHeight(isShortDevice ? 55 : 75),
    },
    illustration: {
      flex: 1,
      marginTop: getDesignRelativeHeight(theme.sizes.default * 8, false),
      alignSelf: 'center',
    },
  }
}

const WelcomeGDScreen = withStyles(getStylesFromProps)(WelcomeGD)

export default WelcomeGDScreen
