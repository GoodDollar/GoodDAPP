import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../__tests__/__util__'
import ImportedWarningPopup from '../ExportWarningPopup'

const ExportWarningPopup = withThemeProvider(ImportedWarningPopup)

describe('ExportWarningPopup', () => {
  it('matches snapshot', async () => {
    let tree
    await renderer.act(async () => (tree = renderer.create(<ExportWarningPopup />)))

    expect(tree.toJSON()).toMatchSnapshot()
  })
})
