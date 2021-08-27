import UserStorageTests from './__suites__/UserStorage'
import ProfileStorageTests from './__suites__/UserProfileStorage'

jest.setTimeout(30000)

describe('UserStorage', () => {
  UserStorageTests()
  ProfileStorageTests()
})
