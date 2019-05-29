import React from 'react'
import { createSwitchNavigator } from '@react-navigation/core'
import { createBrowserApp } from '@react-navigation/web'
import renderer from 'react-test-renderer'
import AppNavigation from '../AppNavigation'
import GDStore from '../../../lib/undux/GDStore'

const { Container } = GDStore

describe('AppNavigation', () => {
  it('renders without errors', () => {
    const WebRouter = createBrowserApp(createSwitchNavigator({ AppNavigation }))
    const tree = renderer.create(
      <Container>
        <WebRouter />
      </Container>
    )
    expect(tree.toJSON()).toBe(null)
  })

  it('matches snapshot', () => {
    const WebRouter = createBrowserApp(createSwitchNavigator({ AppNavigation }))
    const component = renderer.create(
      <Container>
        <WebRouter />
      </Container>
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
