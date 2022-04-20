import React from 'react'
import renderer from 'react-test-renderer'
import SideMenuItem from '../SideMenuItem'
import { withThemeProvider } from '../../../__tests__/__util__'

const SideMenuItemWithTheme = withThemeProvider(SideMenuItem)

describe('SideMenuItem', () => {
  it('matches snapshot', async () => {
    let component

    await renderer.act(
      // eslint-disable-next-line require-await
      async () => (component = renderer.create(<SideMenuItemWithTheme icon="person" name="Profile" />)),
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
