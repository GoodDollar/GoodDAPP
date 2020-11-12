import React from 'react'
import { Image, TouchableOpacity, View } from 'react-native'
import Text from '../../common/view/Text'
import useOnPress from '../../../lib/hooks/useOnPress'
import { theme as mainTheme } from '../../theme/styles'
import { getDesignRelativeHeight } from '../../../lib/utils/sizes'
import { isSmallDevice } from '../../../lib/utils/mobileSizeDetect'
import normalizeText from '../../../lib/utils/normalizeText'

export const LoginButton = ({ style, onPress, testID, icon, disabled, children }) => {
  const onButtonPress = useOnPress(onPress)

  return (
    <TouchableOpacity
      style={[{ maxHeight: getDesignRelativeHeight(44) }, style]}
      onPress={onButtonPress}
      disabled={disabled}
      testID={testID}
    >
      <View style={styles.iconBorder}>
        <Image source={icon} resizeMode="contain" style={styles.iconsStyle} />
      </View>
      <Text textTransform="uppercase" style={styles.buttonText} fontWeight={'medium'} letterSpacing={0} color="white">
        {children}
      </Text>
    </TouchableOpacity>
  )
}

const buttonFontSize = normalizeText(isSmallDevice ? 13 : 16)
const styles = {
  buttonText: {
    fontSize: buttonFontSize,
    flex: 1,
    lineHeight: getDesignRelativeHeight(19),
  },
  iconsStyle: {
    width: getDesignRelativeHeight(20),
    height: getDesignRelativeHeight(20),
  },
  iconBorder: {
    backgroundColor: mainTheme.colors.white,
    borderRadius: getDesignRelativeHeight(40),
    alignItems: 'center',
    height: getDesignRelativeHeight(40),
    width: getDesignRelativeHeight(40),
    justifyContent: 'center',
  },
}
