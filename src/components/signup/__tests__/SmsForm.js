import { createSwitchNavigator } from '@react-navigation/core'
import { createBrowserApp } from '@react-navigation/web'
import React from 'react'
import renderer from 'react-test-renderer'
import { StoresWrapper, withThemeProvider } from '../../../__tests__/__util__'

// Note: test renderer must be required after react-native.

import SmsForm from '../SmsForm'

describe('SmsForm', () => {
  it('renders without errors', () => {
    const WebRouter = withThemeProvider(createBrowserApp(createSwitchNavigator({ SMS: SmsForm })))
    const tree = renderer.create(
      <StoresWrapper>
        <WebRouter />
      </StoresWrapper>,
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const WebRouter = withThemeProvider(createBrowserApp(createSwitchNavigator({ SMS: SmsForm })))
    const component = renderer.create(
      <StoresWrapper>
        <WebRouter />
      </StoresWrapper>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
