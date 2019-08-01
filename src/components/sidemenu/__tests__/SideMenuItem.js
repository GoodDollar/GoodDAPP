import React from 'react'
import renderer from 'react-test-renderer'
import SideMenuItem from '../SideMenuItem'
import { withThemeProvider } from '../../../__tests__/__util__'

const SideMenuItemWithTheme = withThemeProvider(SideMenuItem)

describe('SideMenuItem', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<SideMenuItemWithTheme icon="person" name="Profile" />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<SideMenuItemWithTheme icon="person" name="Profile" />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
