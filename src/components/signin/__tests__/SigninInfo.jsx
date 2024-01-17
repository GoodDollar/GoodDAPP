import { createSwitchNavigator } from '@react-navigation/core'
import { createBrowserApp } from '@react-navigation/web'
import React from 'react'
import renderer from 'react-test-renderer'
import { StoresWrapper, withThemeProvider } from '../../../__tests__/__util__'

// Note: test renderer must be required after react-native.

import SigninInfo from '../SigninInfo'

describe('SigninInfo', () => {
  it('matches snapshot', async () => {
    const WebRouter = withThemeProvider(createBrowserApp(createSwitchNavigator({ SigninInfo })))
    let component

    await renderer.act(
      // eslint-disable-next-line require-await
      async () =>
        (component = renderer.create(
          <StoresWrapper>
            <WebRouter />
          </StoresWrapper>,
        )),
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
