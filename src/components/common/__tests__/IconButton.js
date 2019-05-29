import React from 'react'
import renderer from 'react-test-renderer'
import IconButton from '../IconButton'

describe('IconButton enabled', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<IconButton text="edit" name="accessible" />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<IconButton text="edit" name="accessible" />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})

describe('IconButton disabled', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<IconButton text="edit" name="accessible" disabled />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<IconButton text="edit" name="accessible" disabled />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
