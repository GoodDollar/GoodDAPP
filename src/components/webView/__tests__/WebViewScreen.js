import React from 'react'
import renderer from 'react-test-renderer'
import { PrivacyPolicy, TermsOfUse } from '../webViewInstances'
import { StoresWrapper } from '../../../__tests__/__util__'

// Note: test renderer must be required after react-native.

describe('WebViewScreen Instances', () => {
  it('PrivacyPolicy matches snapshot', () => {
    const component = renderer.create(
      <StoresWrapper>
        <PrivacyPolicy />
      </StoresWrapper>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('TermsOFUse matches snapshot', () => {
    const component = renderer.create(
      <StoresWrapper>
        <TermsOfUse />
      </StoresWrapper>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
