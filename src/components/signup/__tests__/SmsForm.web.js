import { createSwitchNavigator } from '@react-navigation/core'
import { createBrowserApp } from '@react-navigation/web'
import React from 'react'
import renderer from 'react-test-renderer'
import { StoresWrapper } from '../../../lib/undux/utils/storeswrapper.js'

// Note: test renderer must be required after react-native.

import SmsForm from '../SmsForm.web'

describe('SmsForm', () => {
  it('renders without errors', () => {
    const WebRouter = createBrowserApp(createSwitchNavigator({ SmsForm }))
    const tree = renderer.create(
      <StoresWrapper>
        <WebRouter />
      </StoresWrapper>
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const WebRouter = createBrowserApp(createSwitchNavigator({ SmsForm }))
    const component = renderer.create(
      <StoresWrapper>
        <WebRouter />
      </StoresWrapper>
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
