// @flow

import React from 'react'
import PhoneNumberInput from '../../common/form/PhoneNumberInput/PhoneNumberInput'
import Section from '../../common/layout/Section'
import './PhoneNumberInput.css'

export default props => {
  return (
    <Section.Stack className="signup_phone_input">
      <PhoneNumberInput id="signup_phone" {...props} />
    </Section.Stack>
  )
}
