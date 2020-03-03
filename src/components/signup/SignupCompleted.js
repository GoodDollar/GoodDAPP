// @flow
import React from 'react'
import { getFirstWord } from '../../lib/utils/getFirstWord'
import RocketShip from '../common/animations/RocketShip'
import Text from '../common/view/Text'
import CustomWrapper from './signUpWrapper'

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
        <RocketShip />
      </CustomWrapper>
    )
  }
}
