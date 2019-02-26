import React, { useContext } from 'react'
//import { createStackNavigator } from '../../appNavigation/stackNavigation'
import { createSwitchNavigator } from '@react-navigation/core'
import { createBrowserApp } from '@react-navigation/web'

export const getComponentWithMocks = (componentPath, context = { balance: 10 }) => {
  // Will then mock the LocalizeContext module being used in our LanguageSelector component
  jest.doMock('../../appNavigation/AccountProvider', () => {
    const AccountContext = React.createContext({ context })
    const AccountConsumer = AccountContext.Consumer
    const AccountProvider = props => <AccountContext.Provider value={context}>{props.children}</AccountContext.Provider>

    return {
      AccountProvider,
      AccountConsumer,
      AccountContext
    }
  })

  jest.doMock('../../../lib/share', () => {
    return {
      generateCode: () => '0xfakeAddress'
    }
  })

  // you need to re-require after calling jest.doMock.
  return require(componentPath).default
}

export const getWebRouterComponentWithMocks = (componentPath, context) => {
  const Component = getComponentWithMocks(componentPath, context)

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
  return createBrowserApp(createSwitchNavigator({ AppNavigation }))
}
