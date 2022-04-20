import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../../../__tests__/__util__'
import ImportedCameraNotAllowedError from '../CameraNotAllowedError'

const CameraNotAllowedError = withThemeProvider(ImportedCameraNotAllowedError)

const exception = {
  name: 'test',
  error: 'test',
  message: 'test',
}

describe('FaceVerification CameraNotAllowedErrorDialog', () => {
  it('matches snapshot', async () => {
    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<CameraNotAllowedError exception={exception} />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
