import { createSwitchNavigator } from '@react-navigation/core'
import { createBrowserApp } from '@react-navigation/web'
import React from 'react'
import renderer from 'react-test-renderer'
import { StoresWrapper, withThemeProvider } from '../../../__tests__/__util__'

import MagicLinkInfo from '../MagicLinkInfo'

describe('Sign Up Magic Link Info Screen', () => {
  it('renders without errors', () => {
    const WebRouter = withThemeProvider(createBrowserApp(createSwitchNavigator({ MagicLinkInfo })))
    const tree = renderer.create(
      <StoresWrapper>
        <WebRouter />
      </StoresWrapper>,
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const WebRouter = withThemeProvider(createBrowserApp(createSwitchNavigator({ MagicLinkInfo })))
    const component = renderer.create(
      <StoresWrapper>
        <WebRouter />
      </StoresWrapper>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
