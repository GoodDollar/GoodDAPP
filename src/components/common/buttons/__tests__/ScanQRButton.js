import React from 'react'
import renderer from 'react-test-renderer'

import ImportedScanQRButton from '../ScanQRButton'
import { withThemeAndLocalizationProvider } from '../../../../__tests__/__util__'
const ScanQRButton = withThemeAndLocalizationProvider(ImportedScanQRButton)

jest.setTimeout(20000)

describe('ScanQRButton', () => {
  it(`should match snapshot`, async () => {
    // Given
    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<ScanQRButton onPress={() => {}} />)))

    // When
    const tree = component.toJSON()

    // Then
    expect(tree).toMatchSnapshot()
  })
})
