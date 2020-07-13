import React from 'react'
import renderer from 'react-test-renderer'
import WebViewScreen, { createWebViewScreen } from '../WebViewScreen'
import { FAQ, PrivacyPolicy, PrivacyPolicyAndTerms, Support, SupportForUnsigned } from '../webViewInstances'
import { StoresWrapper } from '../../../lib/undux/utils/storeswrapper.js'

// Note: test renderer must be required after react-native.

describe('WebViewScreen', () => {
  it('renders without errors', () => {
    const tree = renderer.create(<WebViewScreen source="sourceUrl" />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<WebViewScreen source="sourceUrl" />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('renders without errors', () => {
    const NewWebScreen = createWebViewScreen('https://community.gooddollar.org/terms/', 'Terms of Use')
    const tree = renderer.create(<NewWebScreen />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const NewWebScreen = createWebViewScreen('https://community.gooddollar.org/terms/', 'Terms of Use')
    const component = renderer.create(<NewWebScreen />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})

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

  it('SupportForUnsigned renders without errors', () => {
    const tree = renderer.create(
      <StoresWrapper>
        <SupportForUnsigned />
      </StoresWrapper>,
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('SupportForUnsigned matches snapshot', () => {
    const component = renderer.create(
      <StoresWrapper>
        <SupportForUnsigned />
      </StoresWrapper>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
