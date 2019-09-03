import React from 'react'
import renderer from 'react-test-renderer'
import SigninInfo from '../SigninInfo'
import { withThemeProvider } from '../../../__tests__/__util__'

const SigninInfoTheme = withThemeProvider(SigninInfo)

describe('SignIn - SigninInfo', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<SigninInfoTheme />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<SigninInfoTheme />)
    const tree = component.toJSON()

    expect(tree).toMatchSnapshot()
  })
})
