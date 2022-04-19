import React from 'react'
import renderer from 'react-test-renderer'
import ImportedModalInnerContents from '../ModalInnerContents'
import { withThemeProvider } from '../../../../__tests__/__util__'
const ModalInnerContents = withThemeProvider(ImportedModalInnerContents)

// Note: test renderer must be required after react-native.

describe('ModalInnerContents', () => {
  it('matches snapshot', async () => {
    let component
    await renderer.act(
      async () =>
        (component = renderer.create(
          <ModalInnerContents>
            <React.Fragment>Testing</React.Fragment>
          </ModalInnerContents>,
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
          <ModalInnerContents>
            <React.Fragment>Testing</React.Fragment>
          </ModalInnerContents>,
        )),
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
