import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Icon } from 'react-native-elements'

const IconButton = ({ text, onPress, ...iconProps }) => (
  <View style={styles.container} onClick={onPress}>
    <Icon reverse color="white" reverseColor="#282c34" {...iconProps} />
    <Text>{text}</Text>
  </View>
)

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    cursor: 'pointer'
  }
})

export default IconButton
