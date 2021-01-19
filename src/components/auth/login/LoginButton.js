import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import Text from '../../common/view/Text'
import useOnPress from '../../../lib/hooks/useOnPress'
import { theme as mainTheme } from '../../theme/styles'
import { getDesignRelativeHeight, isSmallDevice } from '../../../lib/utils/sizes'
import normalizeText from '../../../lib/utils/normalizeText'

export const LoginButton = ({ style, onPress, testID, icon: IconSVG, disabled, children, iconProps = {} }) => {
  const onButtonPress = useOnPress(onPress)

  return (
    <TouchableOpacity
      style={[{ maxHeight: getDesignRelativeHeight(44) }, style]}
      onPress={onButtonPress}
      disabled={disabled}
      testID={testID}
    >
      <View style={styles.iconBorder}>
        <IconSVG height="100%" width="100%" {...iconProps} />
      </View>
      <Text textTransform="uppercase" style={styles.buttonText} fontWeight={'bold'} letterSpacing={0} color="white">
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
  iconBorder: {
    backgroundColor: mainTheme.colors.white,
    borderRadius: getDesignRelativeHeight(40),
    alignItems: 'center',
    height: getDesignRelativeHeight(40),
    width: getDesignRelativeHeight(40),
    justifyContent: 'center',
    padding: getDesignRelativeHeight(10),
  },
}
