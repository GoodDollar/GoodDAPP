import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../../__tests__/__util__'
import ImportedErrorScreen from '../screens/ErrorScreen'

const ErrorScreen = withThemeProvider(ImportedErrorScreen)

const screenState = {
  isValid: false,
  error: {
    name: 'test',
    error: 'test',
    message: 'test',
  },
  allowRetry: true,
  reason: {},
  description: 'test',
  action: ' test',
  title: 'Something went wrong...',
  log: null,
}

describe('FaceVerificationIntro', () => {
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
