import React from 'react'
import BuySell from '../BuySell'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

describe('BuySell', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<BuySell />)
    expect(tree.toJSON()).toBeTruthy()
  })
})
