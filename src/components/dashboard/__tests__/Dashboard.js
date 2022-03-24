import { createSwitchNavigator } from '@react-navigation/core'
import { createBrowserApp } from '@react-navigation/web'
import React from 'react'
import renderer from 'react-test-renderer'

import { StoresWrapper, withThemeProvider } from '../../../__tests__/__util__'
import { initUserStorage } from '../../../lib/userStorage/__tests__/__util__'
import { getComponentWithMocks } from './__util__'

const routes = {
  Dashboard: getComponentWithMocks('../Dashboard'),
}

const AppNavigator = createSwitchNavigator(routes)
class AppNavigation extends React.Component<AppNavigationProps, AppNavigationState> {
  static router = AppNavigator.router

  render() {
    const WrappedAppNavigator = withThemeProvider(AppNavigator)
    return (
      <StoresWrapper>
        <WrappedAppNavigator navigation={this.props.navigation} screenProps={{ routes }} />
      </StoresWrapper>
    )
  }
}

describe('Dashboard', () => {
  beforeAll(async () => {
    await initUserStorage()
  })

  it('renders without errors', () => {
    const WebRouter = createBrowserApp(createSwitchNavigator({ AppNavigation }))

    const tree = renderer.create(<WebRouter />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const WebRouter = createBrowserApp(createSwitchNavigator({ AppNavigation }))

    const component = renderer.create(<WebRouter />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
