import React from 'react'
import renderer from 'react-test-renderer'
import ImportedModalWrapper from '../ModalWrapper'
import { withThemeProvider } from '../../../../__tests__/__util__'
const ModalWrapper = withThemeProvider(ImportedModalWrapper)

// Note: test renderer must be required after react-native.

describe('ModalWrapper', () => {
  it('matches snapshot', async () => {
    let component
    await renderer.act(
      async () =>
        (component = renderer.create(
          <ModalWrapper>
            <React.Fragment>Testing</React.Fragment>
          </ModalWrapper>,
        )),
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot with properties', async () => {
    let component
    await renderer.act(
      async () =>
        (component = renderer.create(
          <ModalWrapper showJaggedEdge={true}>
            <React.Fragment>Testing</React.Fragment>
          </ModalWrapper>,
        )),
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
