import React from 'react'
import renderer from 'react-test-renderer'

import GDStore from '../../../../lib/undux/GDStore'
import ImportedReceiveToAddressButton from '../ReceiveToAddressButton'
import { withThemeProvider } from '../../../../__tests__/__util__'
const ReceiveToAddressButton = withThemeProvider(ImportedReceiveToAddressButton)

const { Container } = GDStore

describe('SendToAddressButton', () => {
  it(`should render without errors`, () => {
    // Given
    const component = renderer.create(
      <Container>
        <ReceiveToAddressButton onPress={() => {}} />
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
        <ReceiveToAddressButton onPress={() => {}} />
      </Container>,
    )

    // When
    const tree = component.toJSON()

    // Then
    expect(tree).toMatchSnapshot()
  })
})
