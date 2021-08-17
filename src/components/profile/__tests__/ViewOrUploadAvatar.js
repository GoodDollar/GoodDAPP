// eslint-disable-next-line import/order
import { initUserStorage } from '../../../lib/userStorage/__tests__/__util__'
import React from 'react'
import renderer from 'react-test-renderer'
import { withThemeProvider } from '../../../__tests__/__util__'
import ViewOrUploadAvatar from '../ViewOrUploadAvatar'

jest.setTimeout(20000)

describe('ViewAvatar', () => {
  const WrappedViewOrUploadAvatar = withThemeProvider(ViewOrUploadAvatar)

  beforeAll(async () => {
    await initUserStorage()
  })

  it('renders without errors', () => {
    const tree = renderer.create(<WrappedViewOrUploadAvatar />)
    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<WrappedViewOrUploadAvatar />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
