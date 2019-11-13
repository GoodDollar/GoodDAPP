import React from 'react'
import renderer from 'react-test-renderer'
import { getWebRouterComponentWithMocks } from './__util__'

// Note: test renderer must be required after react-native.

describe('BackupWallet', () => {
  it('renders without errors', () => {
    const BacupWallet = getWebRouterComponentWithMocks('../BackupWallet')
    const tree = renderer.create(<BacupWallet />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const BacupWallet = getWebRouterComponentWithMocks('../BackupWallet')
    const component = renderer.create(<BacupWallet />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
