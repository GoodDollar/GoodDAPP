import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../../../__tests__/__util__'
import ImportedDuplicateFoundError from '../DuplicateFoundError'

const DuplicateFoundError = withThemeProvider(ImportedDuplicateFoundError)

const screenState = {
  isValid: false,
  error: {
    name: 'test',
    error: 'test',
    message: 'test',
  },
  allowRetry: true,
}

describe('FaceVerification DuplicateFoundError', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<DuplicateFoundError screenProps={{ screenState }} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<DuplicateFoundError screenProps={{ screenState }} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
