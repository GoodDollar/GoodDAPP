import React from 'react'
import renderer from 'react-test-renderer'
import Icon from '../Icon'

// Note: test renderer must be required after react-native.

describe('Icon', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<Icon name="feed-social-good-filled" />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<Icon name="feed-social-good-filled" />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
