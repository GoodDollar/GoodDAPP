import React from 'react'
import renderer from 'react-test-renderer'
import WebViewScreen, { createWebViewScreen } from '../WebViewScreen'
import { PrivacyPolicy, TermsOfUse } from '../webViewInstances'

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
  it('TermsOfUse renders without errors', () => {
    const tree = renderer.create(<TermsOfUse />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('TermsOfUse matches snapshot', () => {
    const component = renderer.create(<TermsOfUse />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('PrivacyPolicy renders without errors', () => {
    const tree = renderer.create(<PrivacyPolicy />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('PrivacyPolicy matches snapshot', () => {
    const component = renderer.create(<PrivacyPolicy />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
