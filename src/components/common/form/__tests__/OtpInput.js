import React from 'react'
import renderer from 'react-test-renderer'
import OtpInput from '../OtpInput'
import { withThemeProvider } from '../../../../__tests__/__util__'

// Note: test renderer must be required after react-native.

describe('OtpInput', () => {
  const WrappedOtpInput = withThemeProvider(OtpInput)

  it('empty matches snapshot', async () => {
    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<WrappedOtpInput numInputs={6} isInputNum={true} />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('number matches snapshot', async () => {
    let component

    await renderer.act(
      // eslint-disable-next-line require-await
      async () => (component = renderer.create(<WrappedOtpInput numInputs={6} isInputNum={true} value="1234" />)),
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot', async () => {
    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<WrappedOtpInput numInputs={6} value="Text" />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
