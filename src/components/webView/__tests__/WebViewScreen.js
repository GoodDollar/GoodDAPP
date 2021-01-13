import React from 'react'
import renderer from 'react-test-renderer'
import { FAQ, PrivacyPolicy, PrivacyPolicyAndTerms, Support, TermsOfUse } from '../webViewInstances'
import { StoresWrapper } from '../../../lib/undux/utils/storeswrapper.js'

// Note: test renderer must be required after react-native.

describe('WebViewScreen Instances', () => {
  it('PrivacyPolicyAndTerms renders without errors', () => {
    const tree = renderer.create(
      <StoresWrapper>
        <PrivacyPolicyAndTerms />
      </StoresWrapper>,
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('PrivacyPolicyAndTerms matches snapshot', () => {
    const component = renderer.create(
      <StoresWrapper>
        <PrivacyPolicyAndTerms />
      </StoresWrapper>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('PrivacyPolicy renders without errors', () => {
    const tree = renderer.create(
      <StoresWrapper>
        <PrivacyPolicy />
      </StoresWrapper>,
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('PrivacyPolicy matches snapshot', () => {
    const component = renderer.create(
      <StoresWrapper>
        <PrivacyPolicy />
      </StoresWrapper>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('TermsOFUse renders without errors', () => {
    const tree = renderer.create(
      <StoresWrapper>
        <TermsOfUse />
      </StoresWrapper>,
    )
    expect(tree.toJSON()).toBeTruthy()
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

  it('FAQ renders without errors', () => {
    const tree = renderer.create(
      <StoresWrapper>
        <FAQ />
      </StoresWrapper>,
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('FAQ matches snapshot', () => {
    const component = renderer.create(
      <StoresWrapper>
        <FAQ />
      </StoresWrapper>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('Support renders without errors', () => {
    const tree = renderer.create(
      <StoresWrapper>
        <Support />
      </StoresWrapper>,
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('Support matches snapshot', () => {
    const component = renderer.create(
      <StoresWrapper>
        <Support />
      </StoresWrapper>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
