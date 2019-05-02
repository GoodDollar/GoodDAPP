import React from 'react'
import Address from '../Address'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

describe('Address', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<Address />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<Address />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
