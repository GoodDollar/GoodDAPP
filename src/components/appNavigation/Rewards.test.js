import React from 'react'
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import Rewards from './Rewards'

describe('Rewards', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<Rewards />)
    expect(tree.toJSON()).toBeTruthy()
  })
})
