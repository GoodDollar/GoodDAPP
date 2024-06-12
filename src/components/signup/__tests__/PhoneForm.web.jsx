import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../__tests__/__util__'
import { getWebRouterComponentWithMocks } from './__util__'

describe('PhoneForm', () => {
  it('matches snapshot', async () => {
    const PhoneForm = withThemeProvider(
      getWebRouterComponentWithMocks('../PhoneForm', {
        mobile: '',
        fullName: 'Kevin Bardi',
      }),
    )
    let component

    // eslint-disable-next-line require-await
    await renderer.act(async () => (component = renderer.create(<PhoneForm />)))
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
