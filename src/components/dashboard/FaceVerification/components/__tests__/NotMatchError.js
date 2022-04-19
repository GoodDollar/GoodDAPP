import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../../../__tests__/__util__'
import ImportedNotMatchError from '../NotMatchError'

const NotMatchError = withThemeProvider(ImportedNotMatchError)

const exception = {
  name: 'test',
  error: 'test',
  message: 'test',
}

describe('FaceVerification DuplicateFoundError', () => {
  it('matches snapshot', async () => {
    let component
    await renderer.act(async () => (component = renderer.create(<NotMatchError exception={exception} />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
