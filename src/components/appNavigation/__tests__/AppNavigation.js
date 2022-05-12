import React from 'react'
import { createSwitchNavigator } from '@react-navigation/core'
import { createBrowserApp } from '@react-navigation/web'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import AppNavigation from '../AppNavigation'

import { withThemeProvider } from '../../../__tests__/__util__'

jest.setTimeout(30000)

describe('AppNavigation', () => {
  it('matches snapshot', async () => {
    const WebRouter = withThemeProvider(createBrowserApp(createSwitchNavigator({ AppNavigation })))
    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<WebRouter />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
