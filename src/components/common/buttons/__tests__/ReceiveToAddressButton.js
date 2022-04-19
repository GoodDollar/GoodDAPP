import React from 'react'
import renderer from 'react-test-renderer'

import ImportedReceiveToAddressButton from '../ReceiveToAddressButton'
import { withThemeAndLocalizationProvider } from '../../../../__tests__/__util__'
const ReceiveToAddressButton = withThemeAndLocalizationProvider(ImportedReceiveToAddressButton)

describe('ReceiveToAddressButton', () => {
  it(`should match snapshot`, async () => {
    // Given
    let component
    renderer.act(async () => (component = renderer.create(<ReceiveToAddressButton onPress={() => {}} />)))

    // When
    const tree = component.toJSON()

    // Then
    expect(tree).toMatchSnapshot()
  })
})
