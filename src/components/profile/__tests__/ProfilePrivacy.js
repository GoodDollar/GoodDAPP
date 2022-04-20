import React from 'react'
import renderer from 'react-test-renderer'
import { getWebRouterComponentWithMocks } from '../../dashboard/__tests__/__util__'

describe('ProfilePrivacy', () => {
  const ProfilePrivacy = getWebRouterComponentWithMocks('../../profile/ProfilePrivacy')

  it('matches snapshot', async () => {
    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<ProfilePrivacy />)))
    const tree = component.toJSON()

    expect(tree).toMatchSnapshot()
  })
})
