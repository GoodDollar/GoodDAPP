// eslint-disable-next-line import/order
import { initUserStorage } from '../../../../lib/userStorage/__tests__/__util__'
import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../../__tests__/__util__'
import ImportedIntroScreen from '../screens/IntroScreen'
import LanguageProvider from '../../../../language/i18n'

const IntroScreen = withThemeProvider(ImportedIntroScreen)
const screenState = {
  isValid: true,
}

jest.setTimeout(30000)

describe('FaceVerification IntroScreen', () => {
  beforeAll(async () => {
    await initUserStorage()
  })

  it('renders without errors', () => {
    const tree = renderer.create(
      <LanguageProvider>
        <IntroScreen screenProps={{ pop: () => {}, screenState }} />
      </LanguageProvider>,
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(
      <LanguageProvider>
        <IntroScreen screenProps={{ pop: () => {}, screenState }} />
      </LanguageProvider>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
