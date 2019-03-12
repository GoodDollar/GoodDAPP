import { createSwitchNavigator } from '@react-navigation/core'
import { createBrowserApp } from '@react-navigation/web'
import React from 'react'
import GDStore from '../../../../lib/undux/GDStore'
const { Container } = GDStore

export const getComponentWithMocks = componentPath => {
  // Will then mock the LocalizeContext module being used in our LanguageSelector component
  jest.doMock('../../../../lib/share', () => {
    return {
      generateCode: () => '0xfakeAddress'
    }
  })

  // you need to re-require after calling jest.doMock.
  return require(`../${componentPath}`).default
}

const withContainer = Component => props => (
  <Container>
    <Component {...props} />
  </Container>
)

export const getWebRouterComponentWithMocks = componentPath => {
  const Component = getComponentWithMocks(componentPath)

  const routes = {
    Component
  }

  const AppNavigator = createSwitchNavigator(routes)
  class AppNavigation extends React.Component<AppNavigationProps, AppNavigationState> {
    static router = AppNavigator.router

    render() {
      return <AppNavigator navigation={this.props.navigation} screenProps={{ routes }} />
    }
  }
  return withContainer(createBrowserApp(createSwitchNavigator({ AppNavigation })))
}
