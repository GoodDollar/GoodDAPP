import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../__tests__/__util__'
import ImportedAbout from '../About'
import LanguageProvider from '../../../language/i18n'

const About = withThemeProvider(ImportedAbout)

describe('About', () => {
  it('renders without errors', () => {
    const tree = renderer.create(
      <LanguageProvider>
        <About />
      </LanguageProvider>,
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(
      <LanguageProvider>
        <About />
      </LanguageProvider>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
