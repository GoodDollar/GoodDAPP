import React from 'react'
import renderer from 'react-test-renderer'
import ImportedModalContents from '../ModalContents'
import { withThemeProvider } from '../../../../__tests__/__util__'
const ModalContents = withThemeProvider(ImportedModalContents)

// Note: test renderer must be required after react-native.

describe('ModalContents', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<ModalContents />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(
      <ModalContents>
        <React.Fragment>Testing</React.Fragment>
      </ModalContents>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot with properties', () => {
    const component = renderer.create(
      <ModalContents>
        <React.Fragment>Testing</React.Fragment>
      </ModalContents>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
