import React from 'react'
import renderer from 'react-test-renderer'
import { getWebRouterComponentWithMocks } from './__util__'

describe('PhoneForm', () => {
  it('renders without errors', () => {
    const PhoneForm = getWebRouterComponentWithMocks('../PhoneForm.web', {
      mobile: '',
      fullName: 'Kevin Bardi'
    })
    const tree = renderer.create(<PhoneForm />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const PhoneForm = getWebRouterComponentWithMocks('../PhoneForm.web', {
      mobile: '',
      fullName: 'Kevin Bardi'
    })
    const component = renderer.create(<PhoneForm />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
