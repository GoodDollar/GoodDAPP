import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import App from '../App'
import SimpleStore from '../lib/undux/SimpleStore'

const { Container } = SimpleStore

describe('App', () => {
  it('renders without errors', () => {
    const tree = renderer.create(
      <Container>
        <App />
      </Container>
    )
    expect(tree.toJSON()).toBeTruthy()
  })
})
