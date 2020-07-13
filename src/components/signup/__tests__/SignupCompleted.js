import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../__tests__/__util__'
import { getWebRouterComponentWithMocks } from './__util__'

describe('SignupCompleted', () => {
  it('renders without errors', () => {
    const SignupCompleted = withThemeProvider(
      getWebRouterComponentWithMocks('../SignupCompleted', {
        email: 'kevin.bardi@altoros.com',
        fullName: 'Kevin Bardi',
        loading: false,
        doneCallback: () => {},
      }),
    )
    const tree = renderer.create(<SignupCompleted />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const SignupCompleted = withThemeProvider(
      getWebRouterComponentWithMocks('../SignupCompleted', {
        mobile: 'kevin.bardi@altoros.com',
        fullName: 'Kevin Bardi',
        loading: false,
        doneCallback: () => {},
      }),
    )
    const component = renderer.create(<SignupCompleted />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
