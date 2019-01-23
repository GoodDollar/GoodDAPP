// @flow
import React from 'react'
import styled from 'styled-components/native'
import { View } from 'react-native'
import { IconButton, Button } from 'react-native-paper'

export const BackButton = ({ back, ...other }) => (
  <IconButton style={{ marginTop: '15px' }} icon="arrow-back" size={20} onPress={() => back()} {...other} />
)
export const ContinueButton = (props: { valid: boolean, handleSubmit: () => any }) => (
  <Button
    style={{ marginLeft: 'auto', marginRight: 'auto', marginTop: '15px' }}
    mode="contained"
    color="green"
    text="Continue"
    disabled={!props.valid}
    onPress={props.handleSubmit}
  >
    Continue
  </Button>
)
export const Wrapper = props => (
  <View style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }} {...props} />
)
