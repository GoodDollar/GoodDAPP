import React from 'react'
import renderer from 'react-test-renderer'
import signUpWrapper from '../signUpWrapper'
import { withThemeProvider } from '../../../__tests__/__util__'

const SignUpWrapperTheme = withThemeProvider(signUpWrapper)

describe('SignUp - signUpWrapper', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<SignUpWrapperTheme />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<SignUpWrapperTheme />)
    const tree = component.toJSON()

    expect(tree).toMatchSnapshot()
  })
})
