// eslint-disable-next-line import/order
import { initUserStorage } from '../../../lib/userStorage/__tests__/__util__'
import React from 'react'
import renderer from 'react-test-renderer'
import { getWebRouterComponentWithMocks } from '../../dashboard/__tests__/__util__'
import GDStore from '../../../lib/undux/GDStore'
import SimpleStore from '../../../lib/undux/SimpleStore'

// Note: test renderer must be required after react-native.

jest.setTimeout(30000)

describe('Profile', () => {
  beforeAll(async () => {
    await initUserStorage()
  })

  it('renders without errors', () => {
    const Profile = getWebRouterComponentWithMocks('../../profile/Profile')

    const tree = renderer.create(
      <SimpleStore.Container>
        <GDStore.Container>
          <Profile />
        </GDStore.Container>
      </SimpleStore.Container>,
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const Profile = getWebRouterComponentWithMocks('../../profile/Profile')
    const component = renderer.create(
      <SimpleStore.Container>
        <GDStore.Container>
          <Profile />
        </GDStore.Container>
      </SimpleStore.Container>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
