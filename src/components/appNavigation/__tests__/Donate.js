import React from 'react'
import Donate from '../Donate'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

describe('Donate', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<Donate />)
    expect(tree.toJSON()).toBeTruthy()
  })
})
