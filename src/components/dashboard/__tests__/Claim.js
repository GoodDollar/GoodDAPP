import React from 'react'
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import GDStore from '../../../lib/undux/GDStore'
import { getWebRouterComponentWithMocks } from './__util__'

const { Container } = GDStore

describe('Claim', () => {
  it('renders without errors', () => {
    const Claim = getWebRouterComponentWithMocks('../Claim')
    const tree = renderer.create(
      <Container>
        <Claim />
      </Container>
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const Claim = getWebRouterComponentWithMocks('../Claim')
    const component = renderer.create(
      <Container>
        <Claim />
      </Container>
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
