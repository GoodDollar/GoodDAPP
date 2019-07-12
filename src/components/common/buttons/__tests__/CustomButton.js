import React from 'react'

import renderer from 'react-test-renderer'
import ImportedCustomButton from '../CustomButton'
import { withThemeProvider } from '../../../../__tests__/__util__'
const CustomButton = withThemeProvider(ImportedCustomButton)

// Note: test renderer must be required after react-native.

describe('CustomButton', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<CustomButton>Next</CustomButton>)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<CustomButton>Next</CustomButton>)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
