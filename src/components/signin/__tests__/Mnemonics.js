import React from 'react'
import renderer from 'react-test-renderer'
import Mnemonics from '../Mnemonics'
import { withThemeProvider } from '../../../__tests__/__util__'

const MnemonicsTheme = withThemeProvider(Mnemonics)

describe('SignIn - Mnemonics', () => {
  it('matches snapshot', async () => {
    let component
    await renderer.act(async () => (component = renderer.create(<MnemonicsTheme />)))
    const tree = component.toJSON()

    expect(tree).toMatchSnapshot()
  })
})
