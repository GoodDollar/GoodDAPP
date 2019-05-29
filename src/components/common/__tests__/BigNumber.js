import React from 'react'
import renderer from 'react-test-renderer'
import BigNumber from '../BigNumber'

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
