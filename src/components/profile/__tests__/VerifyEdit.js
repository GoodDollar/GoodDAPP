import React from 'react'
import renderer from 'react-test-renderer'
import { getWebRouterComponentWithMocks } from '../../dashboard/__tests__/__util__'
import GDStore from '../../../lib/undux/GDStore'
import SimpleStore from '../../../lib/undux/SimpleStore'

// Note: test renderer must be required after react-native.

describe('VerifyEdit', () => {
  it('renders without errors', () => {
    const VerifyEdit = getWebRouterComponentWithMocks('../../profile/VerifyEdit')

    const tree = renderer.create(
      <SimpleStore.Container>
        <GDStore.Container>
          <VerifyEdit />
        </GDStore.Container>
      </SimpleStore.Container>
    )

    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const VerifyEdit = getWebRouterComponentWithMocks('../../profile/VerifyEdit')

    const component = renderer.create(
      <SimpleStore.Container>
        <GDStore.Container>
          <VerifyEdit />
        </GDStore.Container>
      </SimpleStore.Container>
    )

    const tree = component.toJSON()

    expect(tree).toMatchSnapshot()
  })
})
