import React from 'react'
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import GDStore from '../../../lib/undux/GDStore'
import { getWebRouterComponentWithMocks } from './__util__'

const { Container } = GDStore

describe('Reason', () => {
  it('renders without errors', () => {
    const Reason = getWebRouterComponentWithMocks('../Reason')
    const tree = renderer.create(
      <Container>
        <Reason />
      </Container>
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const Reason = getWebRouterComponentWithMocks('../Reason')
    const component = renderer.create(
      <Container>
        <Reason />
      </Container>
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
