import React from 'react'
import renderer from 'react-test-renderer'
import ImportedModalContainer from '../ModalContainer'
import { withThemeProvider } from '../../../../__tests__/__util__'
const ModalContainer = withThemeProvider(ImportedModalContainer)

// Note: test renderer must be required after react-native.

describe('ModalContainer', () => {
  it('matches snapshot', async () => {
    let component

    await renderer.act(
      // eslint-disable-next-line require-await
      async () =>
        (component = renderer.create(
          <ModalContainer>
            <React.Fragment>Testing</React.Fragment>
          </ModalContainer>,
        )),
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot with properties', async () => {
    let component

    await renderer.act(
      // eslint-disable-next-line require-await
      async () =>
        (component = renderer.create(
          <ModalContainer fullHeight={true}>
            <React.Fragment>Testing</React.Fragment>
          </ModalContainer>,
        )),
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
