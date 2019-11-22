import React from 'react'
import renderer from 'react-test-renderer'
import Avatar from '../Avatar'

// Note: test renderer must be required after react-native.

describe('Avatar', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<Avatar profile={{}} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<Avatar profile={{}} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
