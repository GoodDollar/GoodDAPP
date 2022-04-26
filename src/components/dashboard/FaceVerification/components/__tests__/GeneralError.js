import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../../../__tests__/__util__'
import ImportedGeneralError from '../GeneralError'

const GeneralError = withThemeProvider(ImportedGeneralError)

const exception = {
  name: 'test',
  error: 'test',
  message: 'test',
}

describe('FaceVerification GeneralError', () => {
  it('matches snapshot', async () => {
    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<GeneralError exception={exception} />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
