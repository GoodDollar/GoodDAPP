import React from 'react'
import WebViewScreen, { createWebViewScreen } from '../WebViewScreen'
import { TermsOfUse, PrivacyPolicy } from '../webViewInstances'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

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
