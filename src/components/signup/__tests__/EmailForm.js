import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../__tests__/__util__'
import { getWebRouterComponentWithMocks } from './__util__'

describe('EmailForm', () => {
  it('matches snapshot', async () => {
    const EmailForm = withThemeProvider(
      getWebRouterComponentWithMocks('../EmailForm', {
        mobile: 'kevin.bardi@altoros.com',
        fullName: 'Kevin Bardi',
      }),
    )
    let component
    await renderer.act(async () => (component = renderer.create(<EmailForm />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
