import React from 'react'
import renderer from 'react-test-renderer'
import BorderedBox from '../BorderedBox'

describe('BorderedBox', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<BorderedBox />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<BorderedBox />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
