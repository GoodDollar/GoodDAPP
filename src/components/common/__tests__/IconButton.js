import React from 'react'
import IconButton from '../IconButton'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

describe('IconButton enabled', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<IconButton text="edit" name="test" />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<IconButton text="edit" name="test" />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})

describe('IconButton disabled', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<IconButton text="edit" name="test" disabled />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<IconButton text="edit" name="test" disabled />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
