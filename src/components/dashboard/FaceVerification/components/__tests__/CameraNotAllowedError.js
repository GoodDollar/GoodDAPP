import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../../../__tests__/__util__'
import ImportedCameraNotAllowedError from '../CameraNotAllowedError'

const CameraNotAllowedError = withThemeProvider(ImportedCameraNotAllowedError)

const screenState = {
  isValid: false,
  error: {
    name: 'test',
    error: 'test',
    message: 'test',
  },
  allowRetry: true,
}

describe('FaceVerification CameraNotAllowedErrorDialog', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<CameraNotAllowedError screenProps={{ screenState }} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<CameraNotAllowedError screenProps={{ screenState }} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
