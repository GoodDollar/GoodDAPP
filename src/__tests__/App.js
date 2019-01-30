import React from 'react'
// Note: test renderer must be required after react-native.
import App from '../App'
import renderer from 'react-test-renderer'

describe('App', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<App />)
    expect(tree.toJSON()).toBeTruthy()
  })
})
