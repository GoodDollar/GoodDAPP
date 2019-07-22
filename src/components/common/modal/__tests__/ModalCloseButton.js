import React from 'react'
import renderer from 'react-test-renderer'
import ImportedModalCloseButton from '../ModalCloseButton'
import { withThemeProvider } from '../../../../__tests__/__util__'
const ModalCloseButton = withThemeProvider(ImportedModalCloseButton)

// Note: test renderer must be required after react-native.

describe('ModalCloseButton', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<ModalCloseButton />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<ModalCloseButton />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot with properties', () => {
    const component = renderer.create(<ModalCloseButton onClose={() => {}} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
