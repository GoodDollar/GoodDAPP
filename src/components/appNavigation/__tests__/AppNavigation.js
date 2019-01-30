import React from 'react'
import AppNavigation from '../AppNavigation'
import { createSwitchNavigator } from '@react-navigation/core'
import { createBrowserApp } from '@react-navigation/web'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

describe('AppNavigation', () => {
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
    const [tabsView] = component.toJSON()
    const [tabButton] = tabsView.children
    tabButton.props.onClick(new Event('fakeEvent'))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
