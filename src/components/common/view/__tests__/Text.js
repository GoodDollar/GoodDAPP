import React from 'react'
import renderer from 'react-test-renderer'
import Text from '../Text'

// Note: test renderer must be required after react-native.

describe('Text', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<Text>Example Text</Text>)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<Text>Example Text</Text>)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot with string color', () => {
    const component = renderer.create(<Text color="red">Example Text</Text>)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot with theme defined color', () => {
    const component = renderer.create(<Text color="primary">Example Text</Text>)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot with different textAlign', () => {
    const component = renderer.create(
      <Text color="red" textAlign="right">
        Example Text
      </Text>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot with different fontSize', () => {
    const component = renderer.create(<Text fontSize={20}>Example Text</Text>)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
