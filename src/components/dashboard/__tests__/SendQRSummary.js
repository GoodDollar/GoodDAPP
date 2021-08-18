// eslint-disable-next-line import/order
import { initUserStorage } from '../../../lib/userStorage/__tests__/__util__'
import React from 'react'
import renderer from 'react-test-renderer'
import { getWebRouterComponentWithMocks } from './__util__'

jest.setTimeout(30000)

describe('SendQRSummary', () => {
  beforeAll(async () => {
    await initUserStorage()
  })

  it('renders without errors', () => {
    const SendQRSummary = getWebRouterComponentWithMocks('../SendQRSummary')
    let component
    renderer.act(() => (component = renderer.create(<SendQRSummary />)))
    const tree = component.toJSON()
    expect(tree).toBeTruthy()
  })

  it('matches snapshot', () => {
    const SendQRSummary = getWebRouterComponentWithMocks('../SendQRSummary')
    let component
    renderer.act(() => (component = renderer.create(<SendQRSummary />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
