import React from 'react'
import renderer from 'react-test-renderer'
import Icon from '../Icon'

// Note: test renderer must be required after react-native.

describe('Icon', () => {
  it('matches snapshot', async () => {
    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<Icon name="clock-filled" />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
