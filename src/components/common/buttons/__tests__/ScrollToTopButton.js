import React from 'react'
import renderer from 'react-test-renderer'
import { noop } from 'lodash'

import GDStore from '../../../../lib/undux/GDStore'
import ImportedScrollToTopButton from '../ScrollToTopButton'
import { withThemeProvider } from '../../../../__tests__/__util__'
const ScrollToTopButton = withThemeProvider(ImportedScrollToTopButton)

const { Container } = GDStore

describe('ScrollToTopButton', () => {
  it(`should render without errors`, () => {
    // Given
    const component = renderer.create(
      <Container>
        <ScrollToTopButton onPress={noop} />
      </Container>
    )

    // When
    const tree = component.toJSON()

    // Then
    expect(tree).toBeTruthy()
  })

  it(`should match snapshot`, () => {
    // Given
    const component = renderer.create(
      <Container>
        <ScrollToTopButton onPress={noop} />
      </Container>
    )

    // When
    const tree = component.toJSON()

    // Then
    expect(tree).toMatchSnapshot()
  })
})
