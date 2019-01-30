import React from 'react'
import Dashboard from '../Dashboard'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

describe('Dashboard', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<Dashboard />)
    expect(tree.toJSON()).toBeTruthy()
  })
})
