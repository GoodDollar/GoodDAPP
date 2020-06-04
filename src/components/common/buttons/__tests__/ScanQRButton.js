import React from 'react'
import renderer from 'react-test-renderer'
import { noop } from 'lodash'

import GDStore from '../../../../lib/undux/GDStore'
import ImportedScanQRButton from '../ScanQRButton'
import { withThemeProvider } from '../../../../__tests__/__util__'
const ScanQRButton = withThemeProvider(ImportedScanQRButton)

const { Container } = GDStore

describe('ScanQRButton', () => {
  it(`should render without errors`, () => {
    // Given
    const component = renderer.create(
      <Container>
        <ScanQRButton onPress={noop} />
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
        <ScanQRButton onPress={noop} />
      </Container>
    )

    // When
    const tree = component.toJSON()

    // Then
    expect(tree).toMatchSnapshot()
  })
})
