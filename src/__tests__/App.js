import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import { App } from '../mainApp/App'
import SimpleStore from '../lib/undux/SimpleStore'
import { UserContextProvider } from '../lib/contexts/userContext'

const { Container } = SimpleStore

describe('App', () => {
  it('renders without errors', () => {
    const tree = renderer.create(
      <Container>
        <UserContextProvider>
          <App />
        </UserContextProvider>
      </Container>,
    )
    expect(tree.toJSON()).toBeTruthy()
  })
})
