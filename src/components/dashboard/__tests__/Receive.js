// eslint-disable-next-line import/order
import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

jest.setTimeout(30000)

let getWebRouterComponentWithMocks
describe('Receive', () => {
  beforeAll(async () => {
    localStorage.setItem(
      'GD_USER_MNEMONIC',
      'burger must derive wrong dry unaware reopen laptop acoustic report slender scene',
    )
    getWebRouterComponentWithMocks = require('./__util__').getWebRouterComponentWithMocks
  })

  it('matches snapshot', async () => {
    const Receive = getWebRouterComponentWithMocks('../Receive')
    let component
    await renderer.act(async () => (component = renderer.create(<Receive />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
