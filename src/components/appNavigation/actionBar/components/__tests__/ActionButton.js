import React from 'react'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'
import { noop } from 'lodash'
import importedActionButton from '../ActionButton'
import userStorage from '../../../../../lib/userStorage/UserStorage'
import { withThemeProvider } from '../../../../../__tests__/__util__/index'
import * as useActionLink from '../../hooks/useActionLink'

jest.setTimeout(30000)

describe('ActionButton', () => {
  beforeAll(async () => {
    await userStorage.wallet.ready
    await userStorage.ready
  })

  const ActionButton = withThemeProvider(importedActionButton)

  it('matches snapshot', async () => {
    const mockedGoToExternal = jest.fn().mockImplementation(() => Promise.resolve())

    const spy = jest.spyOn(useActionLink, 'default')
    spy.mockReturnValue({
      actionIcon: 'learn',
      wasClicked: false,
      trackClicked: noop,
      goToExternal: mockedGoToExternal,
    })

    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<ActionButton />)))
    const tree = component.toJSON()
    expect(spy).toHaveBeenCalled()
    expect(tree).toMatchSnapshot()
  })
})
