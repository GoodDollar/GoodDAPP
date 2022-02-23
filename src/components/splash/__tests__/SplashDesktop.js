import React from 'react'
import renderer from 'react-test-renderer'
import LanguageProvider from '../../../language/i18n'
import { withThemeProvider } from '../../../__tests__/__util__'
import ImportedSplash from '../SplashDesktop'

const SplashDesktop = withThemeProvider(ImportedSplash)

const emptyHandler = () => {}
const mockUrl = 'http://localhost:8000'

describe('SplashDesktop', () => {
  it('renders without errors', () => {
    const tree = renderer.create(
      <LanguageProvider>
        <SplashDesktop onContinue={emptyHandler} urlForQR={mockUrl} />
      </LanguageProvider>,
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(
      <LanguageProvider>
        <SplashDesktop onContinue={emptyHandler} urlForQR={mockUrl} />
      </LanguageProvider>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
