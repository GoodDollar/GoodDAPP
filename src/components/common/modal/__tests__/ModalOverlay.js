import React from 'react'
import renderer from 'react-test-renderer'
import { isMobileOnly } from '../../../../lib/utils/platform'
import ImportedModalOverlay from '../ModalOverlay'
import { withThemeProvider } from '../../../../__tests__/__util__'
import { theme } from '../../../theme/styles'

const ModalOverlay = withThemeProvider(ImportedModalOverlay)

// Note: test renderer must be required after react-native.

describe('ModalOverlay', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<ModalOverlay />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('check height for mobile and desktop device', () => {
    const tree = renderer.create(<ModalOverlay />)
    const height = isMobileOnly ? '100vh' : `${theme.sizes.maxHeightForTabletAndDesktop}px`
    const heightTemplate = tree.toJSON().children[0].props.style.height
    expect(height === heightTemplate).toBeTruthy()
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
