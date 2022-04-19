import React from 'react'
import renderer from 'react-test-renderer'
import ImportedModalContents from '../ModalContents'
import { withThemeProvider } from '../../../../__tests__/__util__'
const ModalContents = withThemeProvider(ImportedModalContents)

// Note: test renderer must be required after react-native.

describe('ModalContents', () => {
  it('matches snapshot', async () => {
    let component
    await renderer.act(
      async () =>
        (component = renderer.create(
          <ModalContents>
            <React.Fragment>Testing</React.Fragment>
          </ModalContents>,
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
          <ModalContents>
            <React.Fragment>Testing</React.Fragment>
          </ModalContents>,
        )),
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
