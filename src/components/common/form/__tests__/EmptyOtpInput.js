import React from 'react'
import renderer from 'react-test-renderer'
import OtpInput from '../OtpInput'
import { withThemeProvider } from '../../../../__tests__/__util__'

// Note: test renderer must be required after react-native.

describe('Empty OtpInput', () => {
  const WrappedOtpInput = withThemeProvider(OtpInput)

  it('renders without errors', () => {
    const tree = renderer.create(<WrappedOtpInput numInputs={6} isInputNum />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('empty matches snapshot', () => {
    const component = renderer.create(<WrappedOtpInput numInputs={6} isInputNum />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
