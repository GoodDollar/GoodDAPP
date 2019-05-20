import React from 'react'
import BigNumber from '../BigNumber'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

describe('BigNumber', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<BigNumber number={10} unit="G$" />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<BigNumber number={10} unit="G$" />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
