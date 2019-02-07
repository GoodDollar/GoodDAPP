import React from 'react'
import Dashboard from '../Dashboard'
import Donate from '../../appNavigation/Donate'
import { createSwitchNavigator } from '@react-navigation/core'
import { createBrowserApp } from '@react-navigation/web'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

describe.skip('Dashboard', () => {
  it('renders without errors', () => {
    const routes = {
      Dashboard,
      Donate
    }

    const AppNavigator = createBrowserApp(createSwitchNavigator(routes))
    class AppNavigation extends React.Component<AppNavigationProps, AppNavigationState> {
      static router = AppNavigator.router

      render() {
        return <AppNavigator navigation={this.props.navigation} screenProps={{ routes }} />
      }
    }

    const tree = renderer.create(<AppNavigation />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const WebRouter = createBrowserApp(createSwitchNavigator({ Dashboard }))

    const component = renderer.create(<WebRouter />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot when changing tab', () => {
    const WebRouter = createBrowserApp(createSwitchNavigator({ Dashboard }))
    const component = renderer.create(<WebRouter />)
    const [tabsView] = component.toJSON()
    const [tabButton] = tabsView.children
    tabButton.props.onClick(new Event('fakeEvent'))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
