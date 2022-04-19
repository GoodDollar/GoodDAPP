import React from 'react'
import renderer from 'react-test-renderer'

import ImportedScrollToTopButton from '../ScrollToTopButton'
import { withThemeProvider } from '../../../../__tests__/__util__'
const ScrollToTopButton = withThemeProvider(ImportedScrollToTopButton)

describe('ScrollToTopButton', () => {
  it(`should match snapshot`, async () => {
    // Given
    let component
    await renderer.act(async () => (component = renderer.create(<ScrollToTopButton onPress={() => {}} />)))

    // When
    const tree = component.toJSON()

    // Then
    expect(tree).toMatchSnapshot()
  })
})
