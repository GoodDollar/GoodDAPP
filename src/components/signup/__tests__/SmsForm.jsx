import { createSwitchNavigator } from '@react-navigation/core'
import { createBrowserApp } from '@react-navigation/web'
import React from 'react'
import renderer from 'react-test-renderer'
import { StoresWrapper, withThemeProvider } from '../../../__tests__/__util__'

// Note: test renderer must be required after react-native.

import SmsForm from '../SmsForm'

describe('SmsForm', () => {
  it('matches snapshot', async () => {
    const WebRouter = withThemeProvider(createBrowserApp(createSwitchNavigator({ SMS: SmsForm })))
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
