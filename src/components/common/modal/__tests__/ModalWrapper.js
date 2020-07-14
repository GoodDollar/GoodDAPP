import React from 'react'
import renderer from 'react-test-renderer'
import ImportedModalWrapper from '../ModalWrapper'
import { withThemeProvider } from '../../../../__tests__/__util__'
const ModalWrapper = withThemeProvider(ImportedModalWrapper)

// Note: test renderer must be required after react-native.

describe('ModalWrapper', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<ModalWrapper />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(
      <ModalWrapper>
        <React.Fragment>Testing</React.Fragment>
      </ModalWrapper>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot with properties', () => {
    const component = renderer.create(
      <ModalWrapper showJaggedEdge={true}>
        <React.Fragment>Testing</React.Fragment>
      </ModalWrapper>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
