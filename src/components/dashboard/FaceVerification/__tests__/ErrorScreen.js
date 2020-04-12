import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../../__tests__/__util__'
import ImportedErrorScreen from '../screens/ErrorScreen'

const VerifyError = withThemeProvider(ImportedErrorScreen)

const screenState = {
  isValid: false,
  error: {
    name: 'test',
    error: 'test',
    message: 'test',
  },
  allowRetry: true,
}

describe('FaceVerificationError', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<VerifyError screenProps={{ screenState }} />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<VerifyError screenProps={{ screenState }} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
