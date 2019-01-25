import React from 'react'
import Rewards from '../Rewards'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

describe('Rewards', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<Rewards />)
    expect(tree.toJSON()).toBeTruthy()
  })
})
