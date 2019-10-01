// @flow
import React from 'react'
import Icon from '../common/view/Icon'
import LoadingIndicator from '../common/view/LoadingIndicator'
import Section from '../common/layout/Section'
import ErrorText from '../common/form/ErrorText'
import OtpInput from '../common/form/OtpInput'
import CustomWrapper from './signUpWrapper'

const DONE = 'DONE'
const WAIT = 'WAIT'
const PENDING = 'PENDING'

class SmsForm extends React.Component<Props, State> {
  render() {
    const {
      errorMessage,
      renderButton,
      loading,
      otp,
      resentCode,
      NumInputs,
      styles,
      handleSubmit,
      handleChange,
      handleRetry,
      mainText,
    } = this.props

    return (
      <CustomWrapper handleSubmit={handleSubmit} footerComponent={() => <React.Fragment />}>
        <Section grow justifyContent="flex-start">
          <Section.Stack justifyContent="flex-start" style={styles.container}>
            <Section.Row justifyContent="center">
              <Section.Title color="darkGray" fontSize={22} fontWeight="500" textTransform="none">
                {mainText}
              </Section.Title>
            </Section.Row>
            <Section.Stack justifyContent="center" style={styles.bottomContent}>
              <OtpInput
                shouldAutoFocus
                numInputs={NumInputs}
                onChange={handleChange}
                hasErrored={errorMessage !== ''}
                errorStyle={styles.errorStyle}
                value={otp}
                placeholder="*"
                isInputNum
              />
              <ErrorText error={errorMessage} />
            </Section.Stack>
          </Section.Stack>
          <Section.Row alignItems="center" justifyContent="center" style={styles.row}>
            <SMSAction status={resentCode ? DONE : renderButton ? PENDING : WAIT} handleRetry={handleRetry} />
          </Section.Row>
        </Section>
        <LoadingIndicator force={loading} />
      </CustomWrapper>
    )
  }
}

const SMSAction = ({ status, handleRetry }) => {
  if (status === DONE) {
    return <Icon size={16} name="success" color="blue" />
  } else if (status === WAIT) {
    return (
      <Section.Text fontSize={14} color="gray80Percent">
        Please wait a few seconds until the SMS arrives
      </Section.Text>
    )
  }
  return (
    <Section.Text fontWeight="medium" fontSize={14} color="primary" onPress={handleRetry}>
      Send me the code again
    </Section.Text>
  )
}

export default SmsForm
