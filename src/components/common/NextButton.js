// @flow
import React from 'react'
import { StyleSheet } from 'react-native'
import { Button, Text } from 'react-native-paper'
import { normalize } from 'react-native-elements'
import { fontStyle } from './styles'

export type ButtonProps = {
  children: any,
  disabled?: boolean,
  mode?: string,
  color?: string,
  style?: any,
  onPress: any
}

export default (props: ButtonProps) => (
  <Button
    style={[props.style, styles.nextButton]}
    mode="contained"
    color="#555555"
    dark={true}
    disabled={props.disabled}
    onPress={props.onPress}
  >
    {typeof props.children === 'string' ? <Text style={styles.buttonText}>{props.children}</Text> : props.children}
  </Button>
)
const styles = StyleSheet.create({
  buttonText: {
    ...fontStyle,
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    padding: normalize(5)
  },
  nextButton: {
    marginBottom: '10px',
    paddingTop: 5,
    paddingBottom: 5,
    justifyContent: 'center'
  }
})
