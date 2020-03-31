import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../../__tests__/__util__'
import ImportedIntroScreen from '../components/IntroScreen'

const IntroScreen = withThemeProvider(ImportedIntroScreen)

describe('FaceVerificationIntro', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<IntroScreen screenProps={{ screenState: {} }} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<IntroScreen screenProps={{ screenState: {} }} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
