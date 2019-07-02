import React from 'react'
import renderer from 'react-test-renderer'
import BigGoodDollar from '../BigGoodDollar'

// Note: test renderer must be required after react-native.

describe('BigGoodDollar', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<BigGoodDollar number={1005} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<BigGoodDollar number={1005} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
