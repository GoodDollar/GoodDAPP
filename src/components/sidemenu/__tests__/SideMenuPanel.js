import React from 'react'
import renderer from 'react-test-renderer'
import SideMenuPanel from '../SideMenuPanel'
import { withThemeProvider } from '../../../__tests__/__util__'

const SideMenuPanelTheme = withThemeProvider(SideMenuPanel)

describe('SideMenuPanel', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<SideMenuPanelTheme />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<SideMenuPanelTheme />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
