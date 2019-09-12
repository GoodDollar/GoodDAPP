import React from 'react'
import renderer from 'react-test-renderer'
import InvalidWeb3TokenError from '../InvalidWeb3TokenError'
import { withThemeProvider } from '../../../__tests__/__util__'

const InvalidWeb3TokenErrorTheme = withThemeProvider(InvalidWeb3TokenError)

describe('SignUp - InvalidWeb3TokenError', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<InvalidWeb3TokenErrorTheme />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<InvalidWeb3TokenErrorTheme />)
    const tree = component.toJSON()

    expect(tree).toMatchSnapshot()
  })
})
