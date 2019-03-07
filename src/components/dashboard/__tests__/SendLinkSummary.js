import React from 'react'
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import { getWebRouterComponentWithMocks } from './__util__'
import GDStore from '../../../lib/undux/GDStore'

const { Container } = GDStore

describe('SendLinkSummary', () => {
  it('renders without errors', () => {
    const SendLinkSummary = getWebRouterComponentWithMocks('../SendLinkSummary')
    const tree = renderer.create(
      <Container>
        <SendLinkSummary />
      </Container>
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const SendLinkSummary = getWebRouterComponentWithMocks('../SendLinkSummary')
    const component = renderer.create(
      <Container>
        <SendLinkSummary />
      </Container>
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
