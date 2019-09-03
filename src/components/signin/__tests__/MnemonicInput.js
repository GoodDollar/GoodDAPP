import React from 'react'
import renderer from 'react-test-renderer'
import MnemonicInput from '../MnemonicInput'
import { withThemeProvider } from '../../../__tests__/__util__'

const MnemonicInputTheme = withThemeProvider(MnemonicInput)

describe('SignIn - MnemonicInput', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<MnemonicInputTheme />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<MnemonicInputTheme />)
    const tree = component.toJSON()

    expect(tree).toMatchSnapshot()
  })
})
