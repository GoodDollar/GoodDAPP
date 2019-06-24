import React from 'react'
import { createSwitchNavigator } from '@react-navigation/core'
import { createBrowserApp } from '@react-navigation/web'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import AppNavigation from '../AppNavigation'
import goodWallet from '../../../lib/wallet/GoodWallet'
import userStorage from '../../../lib/gundb/UserStorage'

import { StoresWrapper } from '../../../lib/undux/utils/storeswrapper.js'

jest.setTimeout(10000)
describe('AppNavigation', () => {
  beforeAll(() => Promise.all([goodWallet.ready, userStorage.ready]))
  it('renders without errors', () => {
    const WebRouter = createBrowserApp(createSwitchNavigator({ AppNavigation }))
    const tree = renderer.create(
      <StoresWrapper>
        <WebRouter />
      </StoresWrapper>
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const WebRouter = createBrowserApp(createSwitchNavigator({ AppNavigation }))
    const component = renderer.create(
      <StoresWrapper>
        <WebRouter />
      </StoresWrapper>
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
