import React from 'react'
import renderer from 'react-test-renderer'
import GDStore from '../../../lib/undux/GDStore'

// Note: test renderer must be required after react-native.

import { getWebRouterComponentWithMocks, getWebRouterComponentWithRoutes } from './__util__'
const { Container } = GDStore

describe('SendLinkSummary', () => {
  it('renders without errors', () => {
    const SendLinkSummary = getWebRouterComponentWithRoutes('../SendLinkSummary')
    const tree = renderer.create(
      <Container>
        <SendLinkSummary />
      </Container>
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const SendLinkSummary = getWebRouterComponentWithMocks('../SendLinkSummary')
    const component = renderer.create(<SendLinkSummary />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
