import React from 'react'
import ListSendEvent from '../ListSendEvent'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

describe('ListSendEvent', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<ListSendEvent />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<ListSendEvent />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
