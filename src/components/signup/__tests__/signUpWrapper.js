import React from 'react'
import renderer from 'react-test-renderer'
import signUpWrapper from '../signUpWrapper'
import { withThemeProvider } from '../../../__tests__/__util__'

const SignUpWrapperTheme = withThemeProvider(signUpWrapper)

describe('SignUp - signUpWrapper', () => {
  it('matches snapshot', async () => {
    let component
    await renderer.act(async () => (component = renderer.create(<SignUpWrapperTheme />)))
    const tree = component.toJSON()

    expect(tree).toMatchSnapshot()
  })
})
