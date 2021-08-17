// eslint-disable-next-line import/order
import { initUserStorage } from '../../../lib/userStorage/__tests__/__util__'
import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import { getWebRouterComponentWithMocks } from './__util__'

jest.setTimeout(20000)

describe('Amount', () => {
  beforeAll(async () => {
    await initUserStorage()
  })

  it('renders without errors', () => {
    const Amount = getWebRouterComponentWithMocks('../Amount')
    const tree = renderer.create(<Amount />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const Amount = getWebRouterComponentWithMocks('../Amount')
    const component = renderer.create(<Amount />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
