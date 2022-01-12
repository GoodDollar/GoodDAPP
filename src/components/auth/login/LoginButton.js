import React from 'react'
import { TouchableOpacity } from 'react-native'
import Text from '../../common/view/Text'
import useOnPress from '../../../lib/hooks/useOnPress'
import { getDesignRelativeHeight, getDesignRelativeWidth, isSmallDevice } from '../../../lib/utils/sizes'
import normalizeText from '../../../lib/utils/normalizeText'

export const LoginButton = ({
  style,
  onPress,
  testID,
  icon: IconSVG,
  disabled,
  children,
  textColor,
  iconProps = {},
}) => {
  const onButtonPress = useOnPress(onPress)

  return (
    <TouchableOpacity
      style={[{ height: getDesignRelativeHeight(50) }, style]}
      onPress={onButtonPress}
      disabled={disabled}
      testID={testID}
    >
      {IconSVG ? <IconSVG {...iconProps} /> : null}
      <Text
        textTransform="uppercase"
        style={styles.buttonText}
        fontWeight={'bold'}
        letterSpacing={0}
        color={textColor || 'white'}
      >
        {children}
      </Text>
    </TouchableOpacity>
  )
}

const buttonFontSize = normalizeText(isSmallDevice ? 13 : 16)
const styles = {
  buttonText: {
    fontSize: buttonFontSize,
    lineHeight: getDesignRelativeHeight(19),
    marginLeft: getDesignRelativeWidth(10),
  },
}
