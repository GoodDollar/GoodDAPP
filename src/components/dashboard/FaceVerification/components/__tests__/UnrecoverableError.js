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
  it('renders without errors', () => {
    const tree = renderer.create(<UnrecoverableError exception={exception} nav={nav} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<UnrecoverableError exception={exception} nav={nav} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
