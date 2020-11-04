import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../../../__tests__/__util__'
import ImportedDuplicateFoundError from '../DuplicateFoundError'

const DuplicateFoundError = withThemeProvider(ImportedDuplicateFoundError)

const exception = {
  name: 'test',
  error: 'test',
  message: 'test',
}

describe('FaceVerification DuplicateFoundError', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<DuplicateFoundError exception={exception} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<DuplicateFoundError exception={exception} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
