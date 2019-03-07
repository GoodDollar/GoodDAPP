import { createSwitchNavigator } from '@react-navigation/core'
import { createBrowserApp } from '@react-navigation/web'
import React from 'react'
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import GDStore from '../../../lib/undux/GDStore'
import { getComponentWithMocks } from './__util__'

const { Container } = GDStore

const routes = {
  Dashboard: getComponentWithMocks('../Dashboard'),
  Donate: getComponentWithMocks('../../appNavigation/Donate')
}

const AppNavigator = createSwitchNavigator(routes)
class AppNavigation extends React.Component<AppNavigationProps, AppNavigationState> {
  static router = AppNavigator.router

  render() {
    return (
      <Container>
        <AppNavigator navigation={this.props.navigation} screenProps={{ routes }} />
      </Container>
    )
  }
}

describe('Dashboard', () => {
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

  it('matches snapshot when changing tab', () => {
    const WebRouter = createBrowserApp(createSwitchNavigator({ AppNavigation }))
    const component = renderer.create(<WebRouter />)
    const [tabsView] = component.toJSON().children
    const [tabButton] = tabsView.children
    tabButton.props.onClick(new Event('fakeEvent'))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
