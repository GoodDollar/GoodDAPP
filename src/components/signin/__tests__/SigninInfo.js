import { createSwitchNavigator } from '@react-navigation/core'
import { createBrowserApp } from '@react-navigation/web'
import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../__tests__/__util__'
import { StoresWrapper } from '../../../lib/undux/utils/storeswrapper.js'

// Note: test renderer must be required after react-native.

import SigninInfo from '../SigninInfo'

describe('SigninInfo', () => {
  it('renders without errors', () => {
    const WebRouter = withThemeProvider(createBrowserApp(createSwitchNavigator({ SigninInfo })))
    const tree = renderer.create(
      <StoresWrapper>
        <WebRouter />
      </StoresWrapper>
    )
    expect(tree.toJSON()).toBeTruthy()
  })
  
  it('matches snapshot', () => {
    const WebRouter = withThemeProvider(createBrowserApp(createSwitchNavigator({ SigninInfo })))
    const component = renderer.create(
      <StoresWrapper>
        <WebRouter />
      </StoresWrapper>
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
