import React from 'react'
import renderer from 'react-test-renderer'
import ImportedModalOverlay from '../ModalOverlay'
import { withThemeProvider } from '../../../../__tests__/__util__'
import { theme } from '../../../theme/styles'

const ModalOverlay = withThemeProvider(ImportedModalOverlay)

// Note: test renderer must be required after react-native.

describe('ModalOverlay', () => {
  it('check height for mobile and desktop device', async () => {
    let tree
    await renderer.act(async () => (tree = renderer.create(<ModalOverlay />)))
    const maxHeight = theme.sizes.maxHeightForTabletAndDesktop
    const heightTemplate = tree.toJSON().children[0].props.style.height
    const heightTemplateAsNumber = Number(heightTemplate.match(/\d+/g).join(''))

    expect(maxHeight >= heightTemplateAsNumber).toBeTruthy()
  })

  it('matches snapshot', async () => {
    let component
    await renderer.act(
      async () =>
        (component = renderer.create(
          <ModalOverlay>
            <React.Fragment>Testing</React.Fragment>
          </ModalOverlay>,
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
          <ModalOverlay>
            <React.Fragment>Testing</React.Fragment>
          </ModalOverlay>,
        )),
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
