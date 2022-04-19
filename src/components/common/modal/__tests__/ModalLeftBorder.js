import React from 'react'
import renderer from 'react-test-renderer'
import ImportedModalLeftBorder from '../ModalLeftBorder'
import { withThemeProvider } from '../../../../__tests__/__util__'
const ModalLeftBorder = withThemeProvider(ImportedModalLeftBorder)

// Note: test renderer must be required after react-native.

describe('ModalLeftBorder', () => {
  it('matches snapshot', async () => {
    let component
    await renderer.act(async () => (component = renderer.create(<ModalLeftBorder borderColor="#a3a3a3" />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot with properties', async () => {
    let component
    await renderer.act(async () => (component = renderer.create(<ModalLeftBorder borderColor="#a3a3a3" />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
