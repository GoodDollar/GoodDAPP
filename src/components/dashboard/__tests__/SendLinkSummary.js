import React from 'react'
import renderer from 'react-test-renderer'
import GDStore from '../../../lib/undux/GDStore'
import userStorage from '../../../lib/userStorage/UserStorage'

import { getWebRouterComponentWithMocks, getWebRouterComponentWithRoutes } from './__util__'
const { Container } = GDStore

jest.setTimeout(20000)
describe('SendLinkSummary', () => {
  beforeAll(async () => {
    await userStorage.wallet.ready
    await userStorage.ready
  })
  it('renders without errors', () => {
    const SendLinkSummary = getWebRouterComponentWithRoutes('../SendLinkSummary')
    const tree = renderer.create(
      <Container>
        <SendLinkSummary />
      </Container>,
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const SendLinkSummary = getWebRouterComponentWithMocks('../SendLinkSummary')
    const component = renderer.create(
      <Container>
        <SendLinkSummary />
      </Container>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
