import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../__tests__/__util__'
import { getWebRouterComponentWithMocks } from './__util__'

describe('NameForm', () => {
  it('renders without errors', () => {
    const NameForm = withThemeProvider(
      getWebRouterComponentWithMocks('../NameForm', {
        fullName: 'Kevin Bardi',
      }),
    )
    const tree = renderer.create(<NameForm />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const NameForm = withThemeProvider(
      getWebRouterComponentWithMocks('../NameForm', {
        fullName: 'Kevin Bardi',
      }),
    )
    const component = renderer.create(<NameForm />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders without errors with empty value', () => {
    const NameForm = withThemeProvider(
      getWebRouterComponentWithMocks('../NameForm', {
        fullName: '',
      }),
    )
    const tree = renderer.create(<NameForm />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot with empty value', () => {
    const NameForm = withThemeProvider(
      getWebRouterComponentWithMocks('../NameForm', {
        fullName: '',
      }),
    )
    const component = renderer.create(<NameForm />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
