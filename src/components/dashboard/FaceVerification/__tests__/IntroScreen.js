import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../../__tests__/__util__'
import ImportedIntroScreen from '../screens/IntroScreen'

const IntroScreen = withThemeProvider(ImportedIntroScreen)
const screenState = {
  isValid: true,
}

describe('FaceVerification IntroScreen', () => {
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
