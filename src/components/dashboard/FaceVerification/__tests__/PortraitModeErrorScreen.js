import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../../__tests__/__util__'
import ImportedPortraitModeErrorScreen from '../screens/PortraitModeErrorScreen'

const ErrorScreen = withThemeProvider(ImportedPortraitModeErrorScreen)

const screenState = {
  isValid: false,
  error: {
    name: 'test',
    error: 'test',
    message: 'test',
  },
  allowRetry: true,
}

describe('FaceVerificationDuplicateError', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<ErrorScreen screenProps={{ screenState }} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<ErrorScreen screenProps={{ screenState }} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
