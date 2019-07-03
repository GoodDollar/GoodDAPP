// @flow
import React from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-elements/src/icons/Icon'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import Text from '../view/Text'

type IconProps = {
  text: String,
  onPress: Function,
  disabled: Boolean,
  name: String
}

const customIcons = {
  qrcode: require('../../../assets/icons/qrcode.svg'),
  link: require('../../../assets/icons/link.svg')
}

const CustomIcon = (props: any) => {
  const styles = createStyles(props)
  const customIcon = customIcons[props.name]
  if (customIcon) {
    return (
      <View style={[styles.imageIcon, { backgroundColor: props.color }]}>
        <Image source={customIcon} style={{ width: props.size, height: props.size }} />
      </View>
    )
  }

  return <Icon {...props} />
}

/**
 * Returns a button with an icon and text
 *
 * @param {IconProps} props
 * @param {String} props.text to shown
 * @param {Function} props.onPress action
 * @param {Boolean} props.disabled
 * @param {String} props.name icon name
 * @returns {React.Node}
 */
const IconButton = ({ text, onPress, disabled, name, ...iconProps }: IconProps) => {
  const styles = createStyles({ disabled })

  return (
    <TouchableOpacity style={styles.container} onPress={disabled ? undefined : onPress}>
      <CustomIcon
        size={35}
        reverse
        color="#0C263D"
        name={name}
        reverseColor={disabled ? 'rgba(0, 0, 0, 0.32)' : '#282c34'}
        {...iconProps}
      />
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  )
}

const createStyles = ({ disabled }) =>
  StyleSheet.create({
    container: {
      flexDirection: 'column',
      alignItems: 'center',
      flex: 1,
      cursor: disabled ? 'inherit' : 'pointer'
    },
    text: {
      color: disabled ? 'rgba(0, 0, 0, 0.32)' : 'inherit',
      fontSize: normalize(11)
    },
    imageIcon: {
      borderRadius: '50%',
      padding: normalize(16)
    }
  })

export default IconButton
