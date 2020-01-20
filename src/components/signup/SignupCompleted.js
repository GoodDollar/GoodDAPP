// @flow
import React from 'react'
import { Image, StyleSheet, Platform } from 'react-native'
import { getFirstWord } from '../../lib/utils/getFirstWord'
import illustration from '../../assets/Signup/illustration.svg'
import Text from '../common/view/Text'
import CustomWrapper from './signUpWrapper'

if (Platform.OS === 'web') {
  Image.prefetch(illustration)
}

type Props = {
  screenProps: any,
}
type State = {}
export default class SignupCompleted extends React.Component<Props, State> {
  state = {
    pressSubmit: false,
  }

  handleSubmit = () => {
    this.setState({
      pressSubmit: true,
    })

    this.props.screenProps.doneCallback({ isEmailConfirmed: true })
  }

  render() {
    const { fullName, loading } = this.props.screenProps.data
    const { pressSubmit } = this.state

    return (
      <CustomWrapper valid handleSubmit={this.handleSubmit} submitText="Let's start!" loading={pressSubmit && loading}>
        <Text fontWeight="medium" fontSize={22}>
          {`Thanks ${getFirstWord(fullName)}\nYou're all set`}
        </Text>
        <Image source={illustration} style={styles.illustration} resizeMode="contain" />
      </CustomWrapper>
    )
  }
}

const styles = StyleSheet.create({
  illustration: {
    minWidth: 220,
    maxWidth: '100%',
    minHeight: 260,
  },
})
