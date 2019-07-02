import React from 'react'
import renderer from 'react-test-renderer'

import GDStore from '../../../../lib/undux/GDStore'
import ScanQRButton from '../ScanQRButton'

const { Container } = GDStore

describe('ScanQRButton', () => {
  it(`should render without errors`, () => {
    // Given
    const component = renderer.create(
      <Container>
        <ScanQRButton onPress={() => {}} />
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
        <ScanQRButton onPress={() => {}} />
      </Container>
    )

    // When
    const tree = component.toJSON()

    // Then
    expect(tree).toMatchSnapshot()
  })
})
