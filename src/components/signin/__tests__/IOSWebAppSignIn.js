import React from 'react'
import renderer from 'react-test-renderer'
import IOSWebAppSignIn from '../IOSWebAppSignIn'
import { withThemeProvider } from '../../../__tests__/__util__'

const IOSWebAppSignInTheme = withThemeProvider(IOSWebAppSignIn)

describe('SignIn - IOSWebAppSignIn', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<IOSWebAppSignInTheme />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<IOSWebAppSignInTheme />)
    const tree = component.toJSON()

    expect(tree).toMatchSnapshot()
  })
})
