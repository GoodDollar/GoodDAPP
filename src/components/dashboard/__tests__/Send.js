import React from 'react'
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import GDStore from '../../../lib/undux/GDStore'
import { getWebRouterComponentWithMocks } from './__util__'

const { Container } = GDStore

describe('Send', () => {
  it('renders without errors', () => {
    const Send = getWebRouterComponentWithMocks('../Send')
    const tree = renderer.create(
      <Container>
        <Send />
      </Container>
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const Send = getWebRouterComponentWithMocks('../Send')
    const component = renderer.create(
      <Container>
        <Send />
      </Container>
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
