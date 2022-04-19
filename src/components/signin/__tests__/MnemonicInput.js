import React from 'react'
import renderer from 'react-test-renderer'
import MnemonicInput from '../MnemonicInput'
import { withThemeProvider } from '../../../__tests__/__util__'

const MnemonicInputTheme = withThemeProvider(MnemonicInput)

describe('SignIn - MnemonicInput', () => {
  it('matches snapshot', async () => {
    let component
    await renderer.act(async () => (component = renderer.create(<MnemonicInputTheme />)))
    const tree = component.toJSON()

    expect(tree).toMatchSnapshot()
  })
})
