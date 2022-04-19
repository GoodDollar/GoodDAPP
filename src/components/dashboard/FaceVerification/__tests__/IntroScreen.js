// eslint-disable-next-line import/order
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
  it('matches snapshot', async () => {
    let component
    await renderer.act(
      async () => (component = renderer.create(<IntroScreen screenProps={{ pop: () => {}, screenState }} />)),
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
