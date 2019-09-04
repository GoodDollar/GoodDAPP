import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../__tests__/__util__'
import ImportedSplash from '../SplashDesktop'

const SplashDesktop = withThemeProvider(ImportedSplash)

describe('SplashDesktop', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<SplashDesktop />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<SplashDesktop />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
