import React from 'react'
import renderer from 'react-test-renderer'
import { getWebRouterComponentWithMocks } from './__util__'

describe('EmailForm', () => {
  it('renders without errors', () => {
    const EmailForm = getWebRouterComponentWithMocks('../EmailForm', {
      email: 'kevin.bardi@altoros.com',
      fullName: 'Kevin Bardi'
    })
    const tree = renderer.create(<EmailForm />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const EmailForm = getWebRouterComponentWithMocks('../EmailForm', {
      mobile: 'kevin.bardi@altoros.com',
      fullName: 'Kevin Bardi'
    })
    const component = renderer.create(<EmailForm />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
