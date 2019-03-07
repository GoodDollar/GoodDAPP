import React from 'react'
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import GDStore from '../../../lib/undux/GDStore'
import { getWebRouterComponentWithMocks } from './__util__'

const { Container } = GDStore

describe('Amount', () => {
  it('renders without errors', () => {
    const Amount = getWebRouterComponentWithMocks('../Amount')
    const tree = renderer.create(
      <Container>
        <Amount />
      </Container>
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const Amount = getWebRouterComponentWithMocks('../Amount')
    const component = renderer.create(
      <Container>
        <Amount />
      </Container>
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
