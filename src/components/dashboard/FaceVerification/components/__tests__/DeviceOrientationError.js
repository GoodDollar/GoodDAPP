import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../../../__tests__/__util__'
import ImportedDeviceOrientationError from '../DeviceOrientationError'

const DeviceOrientationError = withThemeProvider(ImportedDeviceOrientationError)

const exception = {
  name: 'test',
  error: 'test',
  message: 'test',
}

describe('FaceVerification DeviceOrientationError', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<DeviceOrientationError exception={exception} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<DeviceOrientationError exception={exception} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
