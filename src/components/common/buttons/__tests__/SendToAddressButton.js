import React from 'react'
import renderer from 'react-test-renderer'

import GDStore from '../../../../lib/undux/GDStore'
import ImportedSendToAddressButton from '../SendToAddressButton'
import { withThemeProvider } from '../../../../__tests__/__util__'
const SendToAddressButton = withThemeProvider(ImportedSendToAddressButton)

const { Container } = GDStore

describe('SendToAddressButton', () => {
  it(`should render without errors`, () => {
    // Given
    const component = renderer.create(
      <Container>
        <SendToAddressButton onPress={() => {}} />
      </Container>,
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
        <SendToAddressButton onPress={() => {}} />
      </Container>,
    )

    // When
    const tree = component.toJSON()

    // Then
    expect(tree).toMatchSnapshot()
  })
})
