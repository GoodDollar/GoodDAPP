// eslint-disable-next-line import/order
import { initUserStorage } from '../../../../lib/userStorage/__tests__/__util__'
import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeAndLocalizationProvider } from '../../../../__tests__/__util__'
import ImportedIntroScreen from '../screens/IntroScreen'

const IntroScreen = withThemeAndLocalizationProvider(ImportedIntroScreen)
const screenState = {
  isValid: true,
}

jest.setTimeout(30000)

describe('FaceVerification IntroScreen', () => {
  beforeAll(async () => {
    await initUserStorage()
  })

  it('renders without errors', () => {
    const tree = renderer.create(<IntroScreen screenProps={{ pop: () => {}, screenState }} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<IntroScreen screenProps={{ pop: () => {}, screenState }} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
