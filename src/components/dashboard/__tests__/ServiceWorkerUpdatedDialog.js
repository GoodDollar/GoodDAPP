import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import { getWebRouterComponentWithMocks } from './__util__'

describe('ServiceWorkerUpdatedDialog', () => {
  it('renders without errors', () => {
    const ServiceWorkerUpdatedDialog = getWebRouterComponentWithMocks('../ServiceWorkerUpdatedDialog')
    const tree = renderer.create(<ServiceWorkerUpdatedDialog />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const ServiceWorkerUpdatedDialog = getWebRouterComponentWithMocks('../ServiceWorkerUpdatedDialog')
    const component = renderer.create(<ServiceWorkerUpdatedDialog />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
