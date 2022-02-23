import React from 'react'
import renderer from 'react-test-renderer'

import GDStore from '../../../../lib/undux/GDStore'
import ImportedScanQRButton from '../ScanQRButton'
import { withThemeProvider } from '../../../../__tests__/__util__'
import LanguageProvider from '../../../../language/i18n'
const ScanQRButton = withThemeProvider(ImportedScanQRButton)

const { Container } = GDStore

jest.setTimeout(20000)

describe('ScanQRButton', () => {
  it(`should render without errors`, () => {
    // Given
    const component = renderer.create(
      <Container>
        <LanguageProvider>
          <ScanQRButton onPress={() => {}} />
        </LanguageProvider>
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
        <LanguageProvider>
          <ScanQRButton onPress={() => {}} />
        </LanguageProvider>
      </Container>,
    )

    // When
    const tree = component.toJSON()

    // Then
    expect(tree).toMatchSnapshot()
  })
})
