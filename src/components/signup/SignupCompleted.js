// @flow
import React from 'react'
import { Image, StyleSheet } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import illustration from '../../assets/Signup/illustration.svg'
import Text from '../common/view/Text'
import CustomWrapper from './signUpWrapper'

type Props = {
  screenProps: any,
}
type State = {}
export default class SignupCompleted extends React.Component<Props, State> {
  handleSubmit = () => {
    this.props.screenProps.doneCallback({ isEmailConfirmed: true })
  }

  render() {
    return (
      <CustomWrapper
        valid={true}
        handleSubmit={this.handleSubmit}
        submitText="Let's start!"
        loading={this.props.screenProps.data.loading}
      >
        <Text fontFamily="medium" fontSize={22} color="darkGray">
          {`Thanks ${this.props.screenProps.data.fullName.split(' ')[0]} \n You're all set`}
        </Text>
        <Image source={illustration} style={styles.illustration} resizeMode="contain" />
      </CustomWrapper>
    )
  }
}

const styles = StyleSheet.create({
  illustration: {
    minWidth: normalize(220),
    maxWidth: '100%',
    minHeight: normalize(260),
  },
})
