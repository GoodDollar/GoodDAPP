import React from 'react'
import renderer from 'react-test-renderer'
import ImportedModalJaggedEdge from '../ModalJaggedEdge'
import { withThemeProvider } from '../../../../__tests__/__util__'
const ModalJaggedEdge = withThemeProvider(ImportedModalJaggedEdge)

// Note: test renderer must be required after react-native.

describe('ModalJaggedEdge', () => {
  it('matches snapshot', async () => {
    let component
    await renderer.act(async () => (component = renderer.create(<ModalJaggedEdge />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
