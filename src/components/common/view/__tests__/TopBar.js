// eslint-disable-next-line import/order
import { initUserStorage } from '../../../../lib/userStorage/__tests__/__util__'
import React from 'react'
import { View } from 'react-native'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import GDStore from '../../../../lib/undux/GDStore'
import { withThemeProvider } from '../../../../__tests__/__util__'
import TopBar from '../TopBar'
import Text from '../Text'

const { Container } = GDStore

jest.setTimeout(20000)

describe('TopBar', () => {
  const WrappedTopBar = withThemeProvider(TopBar)

  beforeAll(async () => {
    await initUserStorage()
  })

  it('renders without errors', () => {
    const tree = renderer.create(
      <Container>
        <WrappedTopBar />
      </Container>,
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot without balance', () => {
    const component = renderer.create(
      <Container>
        <WrappedTopBar hideBalance />
      </Container>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot with balance', () => {
    const component = renderer.create(
      <Container>
        <WrappedTopBar />
      </Container>,
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it(`should render the children component`, () => {
    // Given
    const component = renderer.create(
      <Container>
        <WrappedTopBar>
          <View>
            <Text>Children element</Text>
          </View>
        </WrappedTopBar>
      </Container>,
    )

    // When
    const tree = component.toJSON()

    // Then
    expect(tree).toMatchSnapshot()
  })
})
