import React from 'react'
import ListWithdrawEvent from '../ListWithdrawEvent'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

describe('ListWithdrawEvent', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<ListWithdrawEvent />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<ListWithdrawEvent />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
