// @flow
import React from 'react'
import {
  View, Text
} from 'react-native'
import { Button, IconButton } from 'react-native-paper';
import OtpInput from 'react-otp-input';
import {BackButton,ContinueButton, Wrapper} from './components'


type Props = {
  // callback to report to parent component
  phone:string,
  doneCallback:({isPhoneVerified:boolean}) => null
}
type State = {
  isPhoneVerified:boolean,
  sentSMS:boolean,
}

export default class SmsForm extends React.Component<Props, State> {
    state = {
      isPhoneVerified: false,
      sentSMS:false
    }

    numInputs:number = 5

    componentDidMount() {
      this.focusInput()
      this.listenSMS()
      this.sendSMS()
    }


    handleChange = (otp) => {
      if(otp.length === this.numInputs)
      {
        this.verifyOTP(otp)
      }
    }

    handleSubmit = () => {
      this.props.screenProps.doneCallback({ isPhoneVerified: true })
    }

    // eslint-disable-next-line class-methods-use-this
    listenSMS() {
      const options = {
        length: this.numInputs,
      }

      const success = (otp) => {
        
        let inputs = document.getElementsByClassName("signup_otp")[0].getElementsByTagName("input")
        console.log('GOT OTP', otp);
        otp.split("").forEach((num,i) => {
          console.log(num,i)
          inputs[i].value = num
        })
        this.verifyOTP(otp)
      }

      const failure = () => {
        console.log('Problem in listening OTP');
      }
      console.log('Starting OTP listener:', window.device)

      if(window.OTPAutoVerification)
        window.OTPAutoVerification.startOTPListener(options, success, failure);
    }

    focusInput() {
      if (window.Keyboard && window.Keyboard.show) { window.Keyboard.show() }
    }

    // eslint-disable-next-line class-methods-use-this
    verifyOTP(otp) {
      if (otp.length === this.numInputs) {
        this.setState({valid:true})
        this.handleSubmit()
        return true
      }
      return false
    }

    sendSMS() {
      console.log('sms to:', this.props.phone)
      setTimeout(() => this.setState({ sentSMS: true }), 2000)
    }


    render() {
      return (
        <Wrapper className="signup_otp">
          <Text>{this.state.sentSMS ? 'SMS in 15 secs' : 'Sending SMS...'}</Text>
          {/* Your screen contents depending on current tab. */}
          <OtpInput
              inputStyle={{
                width: '2rem',
                height: '2rem',
                margin: '0 1rem',
                fontSize: '1rem',
                borderRadius: 4,
                border: '1px solid rgba(0,0,0,0.3)',
              }}
              shouldAutoFocus
              numInputs={this.numInputs}
              onChange={this.handleChange}
              
            />
          <ContinueButton valid={this.state.valid} handleSubmit={this.handleSubmit}/>
          <BackButton {...this.props.screenProps}/>
        </Wrapper>
      );
    }
}
