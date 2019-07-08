import { createSwitchNavigator } from '@react-navigation/core'
import { createBrowserApp } from '@react-navigation/web'
import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import { StoresWrapper } from '../../../lib/undux/utils/storeswrapper.js'

import userStorage from '../../../lib/gundb/UserStorage'
import { getComponentWithMocks } from './__util__'

const routes = {
  Dashboard: getComponentWithMocks('../Dashboard')
}

const AppNavigator = createSwitchNavigator(routes)
class AppNavigation extends React.Component<AppNavigationProps, AppNavigationState> {
  static router = AppNavigator.router

  render() {
    return (
      <StoresWrapper>
        <AppNavigator navigation={this.props.navigation} screenProps={{ routes }} />
      </StoresWrapper>
    )
  }
}

describe('Dashboard', () => {
  it('renders without errors', async () => {
    await userStorage.ready
    const WebRouter = createBrowserApp(createSwitchNavigator({ AppNavigation }))

    const tree = renderer.create(<WebRouter />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', async () => {
    await userStorage.ready
    const WebRouter = createBrowserApp(createSwitchNavigator({ AppNavigation }))

    const component = renderer.create(<WebRouter />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
