import React from 'react'
import renderer from 'react-test-renderer'

import ImportedSendToAddressButton from '../SendToAddressButton'
import { withThemeAndLocalizationProvider } from '../../../../__tests__/__util__'
const SendToAddressButton = withThemeAndLocalizationProvider(ImportedSendToAddressButton)

jest.setTimeout(20000)

describe('SendToAddressButton', () => {
  it(`should match snapshot`, async () => {
    // Given
    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<SendToAddressButton onPress={() => {}} />)))

    // When
    const tree = component.toJSON()

    // Then
    expect(tree).toMatchSnapshot()
  })
})
