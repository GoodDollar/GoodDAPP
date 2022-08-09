import React from 'react'
import renderer from 'react-test-renderer'
import { getWebRouterComponentWithMocks } from './__util__'

describe('Settings', () => {
  const Settings = getWebRouterComponentWithMocks('../../dashboard/Settings')

  it('matches snapshot', async () => {
    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<Settings />)))
    const tree = component.toJSON()

    expect(tree).toMatchSnapshot()
  })
})
