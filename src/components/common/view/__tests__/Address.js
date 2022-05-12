import React from 'react'
import renderer from 'react-test-renderer'
import Address from '../Address'

// Note: test renderer must be required after react-native.

describe('Address', () => {
  it('matches snapshot', async () => {
    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<Address />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
