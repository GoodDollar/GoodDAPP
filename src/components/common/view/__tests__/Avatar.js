import React from 'react'
import renderer from 'react-test-renderer'
import Avatar from '../Avatar'

// Note: test renderer must be required after react-native.

describe('Avatar', () => {
  it('matches snapshot', async () => {
    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<Avatar />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
