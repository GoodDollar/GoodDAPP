import React from 'react'
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import GDStore from '../../../lib/undux/GDStore'
import { getWebRouterComponentWithMocks } from './__util__'

const { Container } = GDStore

describe('SendConfirmation', () => {
  it('renders without errors', () => {
    const SendConfirmation = getWebRouterComponentWithMocks('../SendConfirmation')
    const tree = renderer.create(
      <Container>
        <SendConfirmation />
      </Container>
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const SendConfirmation = getWebRouterComponentWithMocks('../SendConfirmation')
    const component = renderer.create(
      <Container>
        <SendConfirmation />
      </Container>
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
