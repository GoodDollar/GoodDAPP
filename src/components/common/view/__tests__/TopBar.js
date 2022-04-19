// eslint-disable-next-line import/order
import React from 'react'
import { View } from 'react-native'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import { withThemeProvider, withUserStorage } from '../../../../__tests__/__util__'
import TopBar from '../TopBar'
import Text from '../Text'

jest.setTimeout(30000)

describe('TopBar', () => {
  const WrappedTopBar = withThemeProvider(withUserStorage(TopBar))

  it('matches snapshot without balance', async () => {
    let component
    await renderer.act(async () => (component = renderer.create(<WrappedTopBar hideBalance />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot with balance', async () => {
    let component
    await renderer.act(async () => (component = renderer.create(<WrappedTopBar />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it(`should render the children component`, async () => {
    // Given
    let component
    await renderer.act(
      async () =>
        (component = await renderer.create(
          <WrappedTopBar>
            <View>
              <Text>Children element</Text>
            </View>
          </WrappedTopBar>,
        )),
    )

    // When
    const tree = component.toJSON()

    // Then
    expect(tree).toMatchSnapshot()
  })
})
