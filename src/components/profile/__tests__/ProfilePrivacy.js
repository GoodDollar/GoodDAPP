import React from 'react'
import renderer from 'react-test-renderer'
import userStorage from '../../../lib/userStorage/UserStorage'
import { getWebRouterComponentWithMocks } from '../../dashboard/__tests__/__util__'

// Note: test renderer must be required after react-native.
const faceIdentifier = 'fake-face-identifier'
const getFaceIdentifierMock = jest.fn()

describe('ProfilePrivacy', () => {
  const ProfilePrivacy = getWebRouterComponentWithMocks('../../profile/ProfilePrivacy')

  beforeAll(() => (userStorage.getFaceIdentifier = getFaceIdentifierMock))

  beforeEach(() => getFaceIdentifierMock.mockReturnValue(faceIdentifier))

  afterEach(() => getFaceIdentifierMock.mockReset())

  afterAll(() => {
    const { getFaceIdentifier } = userStorage.constructor.prototype

    Object.assign(userStorage, { getFaceIdentifier })
  })

  it('renders without errors', () => {
    const tree = renderer.create(<ProfilePrivacy />)

    expect(tree.toJSON()).toBeTruthy()
  })

  it('matches snapshot', () => {
    const component = renderer.create(<ProfilePrivacy />)
    const tree = component.toJSON()

    expect(tree).toMatchSnapshot()
  })
})
