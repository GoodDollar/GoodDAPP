import React from 'react'
import renderer from 'react-test-renderer'
import { initUserStorage } from '../../../lib/userStorage/__tests__/__util__'
import { getWebRouterComponentWithMocks } from './__util__'

const screenState = {
  isValid: true,
}

describe('Claim', () => {
  beforeAll(async () => {
    jest.setTimeout(15000)
    await initUserStorage()
  })

  it('renders without errors', () => {
    const Claim = getWebRouterComponentWithMocks('../Claim', { screenProps: { screenState } })
    const tree = renderer.create(<Claim />)

    expect(tree).toBeTruthy()
  })

  it('matches snapshot', () => {
    const Claim = getWebRouterComponentWithMocks('../Claim', { screenProps: { screenState } })
    const component = renderer.create(<Claim />)
    const tree = component.toJSON()

    expect(tree).toMatchSnapshot()
  })
})
