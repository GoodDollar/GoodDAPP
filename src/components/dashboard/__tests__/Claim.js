import React from 'react'
import renderer from 'react-test-renderer'
import { getWebRouterComponentWithMocks } from './__util__'

const screenState = {
  isValid: true,
}

describe('Claim', () => {
  it('matches snapshot', async () => {
    const Claim = getWebRouterComponentWithMocks('../Claim', { screenProps: { screenState } })
    let component
    await renderer.act(async () => (component = renderer.create(<Claim />)))
    const tree = component.toJSON()

    expect(tree).toMatchSnapshot()
  })
})
