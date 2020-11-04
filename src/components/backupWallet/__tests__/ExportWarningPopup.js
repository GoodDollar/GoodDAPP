import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../__tests__/__util__'
import ImportedWarningPopup from '../ExportWarningPopup'

const ExportWarningPopup = withThemeProvider(ImportedWarningPopup)

describe('ExportWarningPopup', () => {
  it('renders without errors', () => {
    let tree

    expect(() => (tree = renderer.create(<ExportWarningPopup />))).not.toThrow()
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const tree = renderer.create(<ExportWarningPopup />)

    expect(tree.toJSON()).toMatchSnapshot()
  })
})
