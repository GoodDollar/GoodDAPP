import React from 'react'
import renderer from 'react-test-renderer'
import NavBar from '../NavBar'

describe('NavBar', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<NavBar />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<NavBar />)
    expect(component.toJSON()).toMatchSnapshot()
  })
})
