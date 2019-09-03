import React from 'react'
import renderer from 'react-test-renderer'
import Mnemonics from '../Mnemonics'
import { withThemeProvider } from '../../../__tests__/__util__'

const MnemonicsTheme = withThemeProvider(Mnemonics)

describe('SignIn - Mnemonics', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<MnemonicsTheme />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<MnemonicsTheme />)
    const tree = component.toJSON()

    expect(tree).toMatchSnapshot()
  })
})
