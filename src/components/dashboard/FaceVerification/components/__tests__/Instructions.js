import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../../../__tests__/__util__'
import ImportedInstructions from '../Instructions'

const Instructions = withThemeProvider(ImportedInstructions)

describe('FaceVerification Instructions', () => {
  it('renders without errors', () => {
    let tree

    expect(() => (tree = renderer.create(<Instructions />))).not.toThrow()
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const tree = renderer.create(<Instructions />)

    expect(tree.toJSON()).toMatchSnapshot()
  })
})
