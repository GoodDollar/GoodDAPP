import React from 'react'
import AppNavigation from '../AppNavigation'
import { createSwitchNavigator } from '@react-navigation/core'
import { createBrowserApp, Link } from '@react-navigation/web'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

describe('AppNavigation', () => {
  it('renders without errors', () => {
    const Router = createSwitchNavigator({ AppNavigation })
    const WebRouter = createBrowserApp(Router)
    const tree = renderer.create(<WebRouter />)
    expect(tree.toJSON()).toBeTruthy()
  })
})
