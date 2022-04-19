import React from 'react'
import renderer from 'react-test-renderer'
import SideMenuPanel from '../SideMenuPanel'
import { withThemeProvider } from '../../../__tests__/__util__'

const SideMenuPanelTheme = withThemeProvider(SideMenuPanel)

describe('SideMenuPanel', () => {
  it('matches snapshot', async () => {
    let component
    await renderer.act(async () => (component = renderer.create(<SideMenuPanelTheme />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
