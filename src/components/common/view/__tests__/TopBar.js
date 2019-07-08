import React from 'react'
import { View } from 'react-native'
import { Text } from 'react-native-paper'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import GDStore from '../../../../lib/undux/GDStore'
import TopBar from '../TopBar'

const { Container } = GDStore

describe('TopBar', () => {
  it('renders without errors', () => {
    const tree = renderer.create(
      <Container>
        <TopBar />
      </Container>
    )
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot without balance', () => {
    const component = renderer.create(
      <Container>
        <TopBar hideBalance />
      </Container>
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot with balance', () => {
    const component = renderer.create(
      <Container>
        <TopBar />
      </Container>
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it(`should render the children component`, () => {
    // Given
    const component = renderer.create(
      <Container>
        <TopBar>
          <View>
            <Text>Children element</Text>
          </View>
        </TopBar>
      </Container>
    )

    // When
    const tree = component.toJSON()

    // Then
    expect(tree).toMatchSnapshot()
  })
})
