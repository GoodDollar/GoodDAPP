import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

let getWebRouterComponentWithMocks
describe('ReceiveConfirmation', () => {
  beforeAll(async () => {
    await localStorage.setItem(
      'GD_USER_MNEMONIC',
      'burger must derive wrong dry unaware reopen laptop acoustic report slender scene'
    )
    getWebRouterComponentWithMocks = require('./__util__').getWebRouterComponentWithMocks
  })
  it('renders without errors', () => {
    const ReceiveConfirmation = getWebRouterComponentWithMocks('../ReceiveConfirmation')
    const tree = renderer.create(<ReceiveConfirmation />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const ReceiveConfirmation = getWebRouterComponentWithMocks('../ReceiveConfirmation')
    const component = renderer.create(<ReceiveConfirmation />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
