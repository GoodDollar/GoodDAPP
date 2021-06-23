import React from 'react'
import { createSwitchNavigator } from '@react-navigation/core'
import { createBrowserApp } from '@react-navigation/web'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import { Provider as PaperProvider } from 'react-native-paper'
import AppNavigation from '../AppNavigation'
import { theme } from '../../theme/styles'

import goodWallet from '../../../lib/wallet/GoodWallet'
import userStorage from '../../../lib/gundb/UserStorage'

import { StoresWrapper } from '../../../__tests__/__util__'

jest.setTimeout(30000)

describe('AppNavigation', () => {
  beforeAll(() => Promise.all([goodWallet.ready, userStorage.ready]))
  it('renders without errors', () => {
    const WebRouter = createBrowserApp(createSwitchNavigator({ AppNavigation }))
    const tree = renderer.create(
      <PaperProvider theme={theme}>
        <StoresWrapper>
          <WebRouter />
        </StoresWrapper>
      </PaperProvider>,
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const WebRouter = createBrowserApp(createSwitchNavigator({ AppNavigation }))
    const component = renderer.create(
      <PaperProvider theme={theme}>
        <StoresWrapper>
          <WebRouter />
        </StoresWrapper>
      </PaperProvider>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
