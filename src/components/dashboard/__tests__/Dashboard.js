import { createSwitchNavigator } from '@react-navigation/core'
import { createBrowserApp } from '@react-navigation/web'
import React from 'react'
import renderer from 'react-test-renderer'

import { StoresWrapper, withThemeProvider, withUserStorage } from '../../../__tests__/__util__'
import { getComponentWithMocks } from './__util__'

jest.setTimeout(25000)

const routes = {
  Dashboard: getComponentWithMocks('../Dashboard'),
}

const AppNavigator = createSwitchNavigator(routes)
class AppNavigation extends React.Component<AppNavigationProps, AppNavigationState> {
  static router = AppNavigator.router

  render() {
    const WrappedAppNavigator = withThemeProvider(withUserStorage(AppNavigator))
    return (
      <StoresWrapper>
        <WrappedAppNavigator navigation={this.props.navigation} screenProps={{ routes }} />
      </StoresWrapper>
    )
  }
}

describe('Dashboard', () => {
  it('matches snapshot', async () => {
    const WebRouter = createBrowserApp(createSwitchNavigator({ AppNavigation }))

    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<WebRouter />)))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
