import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../../../__tests__/__util__'
import ImportedUnrecoverableError from '../UnrecoverableError'

const UnrecoverableError = withThemeProvider(ImportedUnrecoverableError)

const nav = {}

const exception = {
  name: 'test',
  error: 'test',
  message: 'test',
}

describe('FaceVerification UnrecoverableError', () => {
  it('matches snapshot', async () => {
    let component
    await renderer.act(
      async () => (component = renderer.create(<UnrecoverableError exception={exception} nav={nav} />)),
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
