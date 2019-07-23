import React from 'react'
import renderer from 'react-test-renderer'
import ImportedModalOverlay from '../ModalOverlay'
import { withThemeProvider } from '../../../../__tests__/__util__'
const ModalOverlay = withThemeProvider(ImportedModalOverlay)

// Note: test renderer must be required after react-native.

describe('ModalOverlay', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<ModalOverlay />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(
      <ModalOverlay>
        <React.Fragment>Testing</React.Fragment>
      </ModalOverlay>
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot with properties', () => {
    const component = renderer.create(
      <ModalOverlay>
        <React.Fragment>Testing</React.Fragment>
      </ModalOverlay>
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
