import React from 'react'
import renderer from 'react-test-renderer'
import NavBar from '../NavBar'

describe('NavBar', () => {
  it('matches snapshot', async () => {
    let component
    await renderer.act(async () => (component = renderer.create(<NavBar />)))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
