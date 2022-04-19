import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import { App } from '../mainApp/App'
import { GlobalTogglesContextProvider } from '../lib/contexts/togglesContext'
describe('App', () => {
  it('renders without errors', () => {
    const tree = renderer.create(
      <GlobalTogglesContextProvider>
        <App />
      </GlobalTogglesContextProvider>,
    )
    expect(tree.toJSON()).toBeTruthy()
  })
})
