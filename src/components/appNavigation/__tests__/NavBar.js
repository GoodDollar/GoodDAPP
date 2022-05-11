import React from 'react'
import renderer from 'react-test-renderer'
import NavBar from '../NavBar'

describe('NavBar', () => {
  it('matches snapshot', async () => {
    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<NavBar />)))
    expect(component.toJSON()).toMatchSnapshot()
  })
})
