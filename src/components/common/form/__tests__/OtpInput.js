import React from 'react'
import renderer from 'react-test-renderer'
import OtpInput from '../OtpInput'
import { withThemeProvider } from '../../../../__tests__/__util__'

// Note: test renderer must be required after react-native.

describe('OtpInput', () => {
  const WrappedOtpInput = withThemeProvider(OtpInput)

  it('renders without errors', () => {
    const tree = renderer.create(<WrappedOtpInput numInputs={3} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('empty matches snapshot', () => {
    const component = renderer.create(<WrappedOtpInput numInputs={6} isInputNum={true} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('number matches snapshot', () => {
    const component = renderer.create(<WrappedOtpInput numInputs={6} isInputNum={true} value="1234" />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<WrappedOtpInput numInputs={6} value="Text" />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
