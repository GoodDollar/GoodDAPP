import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../__tests__/__util__'
import ImportedSplash from '../SplashDesktop'

const SplashDesktop = withThemeProvider(ImportedSplash)

describe('SplashDesktop', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<SplashDesktop urlForQR="https://localhost" />)
    const json = tree.toJSON()
    expect(json).toBeTruthy()
    expect(json).toMatchSnapshot()
  })
})
