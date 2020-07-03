import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../../../__tests__/__util__'
import ImportedDeviceOrientationError from '../DeviceOrientationError'

const DeviceOrientationError = withThemeProvider(ImportedDeviceOrientationError)

const screenState = {
  isValid: false,
  error: {
    name: 'test',
    error: 'test',
    message: 'test',
  },
  allowRetry: true,
}

describe('FaceVerification DeviceOrientationError', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<DeviceOrientationError screenProps={{ screenState }} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<DeviceOrientationError screenProps={{ screenState }} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
