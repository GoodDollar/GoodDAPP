import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../__tests__/__util__'
import { getWebRouterComponentWithMocks } from './__util__'

describe('NameForm', () => {
  it('matches snapshot', async () => {
    const NameForm = withThemeProvider(
      getWebRouterComponentWithMocks('../NameForm', {
        fullName: 'Kevin Bardi',
      }),
    )
    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<NameForm />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('matches snapshot with empty value', async () => {
    const NameForm = withThemeProvider(
      getWebRouterComponentWithMocks('../NameForm', {
        fullName: '',
      }),
    )
    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<NameForm />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
