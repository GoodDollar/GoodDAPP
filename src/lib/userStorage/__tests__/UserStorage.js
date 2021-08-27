/* eslint prettier/prettier: "off" */
import { getUserModel } from '../UserModel'
import userStorage from '../UserStorage'
import { initUserStorage } from './__util__'

jest.setTimeout(30000)

describe('UserStorage', () => {
  const profile = {
    email: 'testuser@google.com',
    fullName: 'Test User',
    username: 'testuser',
    mobile: '+48506234340',
  }

  const checkPrivateProfile = () => {
    const { isValid, getErrors, validate, ...privateProfile } = userStorage.getPrivateProfile()

    expect(privateProfile).toMatchObject(profile)
  }

  const checkDisplayProfile = () => {
    const { isValid, getErrors, validate, ...displayProfile } = userStorage.getDisplayProfile()

    expect(displayProfile).toMatchObject({
      email: 't******r@google.com',
      fullName: 'Test User',
      username: 'testuser',
      mobile: '********4340',
    })
  }

  beforeAll(async () => {
    await initUserStorage()
  })

  beforeEach(async () => {
    jest.restoreAllMocks()

    // Reset profile
    await userStorage.setProfile(profile, true)
  })

  it('logins to realmdb', () => {
    expect(userStorage.getProfile()).not.toBeUndefined()
  })

  it('sets realmdb field', async () => {
    await userStorage.setProfile({ username: 'testname' })

    expect(userStorage.getProfileFieldDisplayValue('username')).toEqual('testname')
  })

  it('updates realmdb field', async () => {
    await userStorage.setProfile({ username: 'testname' }, true)

    expect(userStorage.getProfileFieldDisplayValue('username')).toEqual('testname')
  })

  it('update profile field', async () => {
    await userStorage.setProfileField('username', 'testname2', 'public')

    expect(userStorage.getProfileFieldDisplayValue('username')).toEqual('testname2')
  })

  it('has default user properties', () => {
    expect(userStorage.userProperties.getAll()).toHaveProperty('firstVisitApp', null)
  })

  it('add new user property', async () => {
    await expect(userStorage.userProperties.set('test', true)).resolves.toBeTruthy()

    expect(userStorage.userProperties.get('test')).toBeTruthy()
  })

  it('update existing user property', async () => {
    expect(userStorage.userProperties.get('isMadeBackup')).toBeFalsy()

    await expect(userStorage.userProperties.set('isMadeBackup', true)).resolves.toBeTruthy()
    expect(userStorage.userProperties.get('isMadeBackup')).toBeTruthy()
  })

  it('sets profile field private (encrypted)', async () => {
    await userStorage.setProfileField('email', 'testuser@google.com', 'private')

    expect(userStorage.getProfile().email).toEqual(
      expect.objectContaining({ privacy: 'private', display: '******' })
    )
  })

  it('gets profile field private (decrypted)', async () => {
    await userStorage.setProfileField('email', 'testuser2@google.com', 'private')

    expect(userStorage.getProfile().email.value).toEqual('testuser2@google.com')
  })

  it('returns object with undefined fullName for fake user identifier', async () => {
    await expect(userStorage.getPublicProfile('fake')).resolves.toBeNull()
  })

  it('sets profile field masked', async () => {
    const fixture = [
      ['email', 'johndoe@blah.com', 'masked', 'j*****e@blah.com'],
      ['mobile', '+972-50-7384928', 'masked', '***********4928']
    ]

    await Promise.all(fixture.map(async ([field, value, privacy, display]) => {
      await userStorage.setProfileField(field, value, privacy)

      expect(userStorage.getProfile()[field]).toEqual(expect.objectContaining({ privacy, display }))
    }))
  })

  it('doesnt mask non email/phone profile fields', async () => {
    await userStorage.setProfileField('username', 'John Doe', 'masked')

    expect(userStorage.getProfile().username).toEqual(
      expect.objectContaining({ display: 'John Doe' })
    )
  })

  it('change profile field privacy to public', async () => {
    await userStorage.setProfileField('mobile', '+972-50-7384928', 'masked')
    expect(userStorage.getProfile().mobile).toMatchObject({ privacy: 'masked', display: '***********4928' })

    await userStorage.setProfileFieldPrivacy('mobile', 'public')
    expect(userStorage.getProfile().mobile).toMatchObject({ privacy: 'public', display: '+972-50-7384928' })
  })

  it('change profile field privacy to private', async () => {
    await userStorage.setProfileFieldPrivacy('mobile', 'private')

    expect(userStorage.getProfile().mobile).toEqual(
      expect.objectContaining({ privacy: 'private', display: '******' })
    )
  })

  it('gets display profile', async () => {
    await Promise.all([
      userStorage.setProfileField('mobile', '+22222222222', 'public'),
      userStorage.setProfileField('email', 'johndoe@blah.com', 'masked'),
      userStorage.setProfileField('username', 'hadar2', 'public'),
    ])

    const { isValid, getErrors, validate, ...displayProfile } = userStorage.getDisplayProfile()

    expect(displayProfile).toEqual(
      expect.objectContaining({
        username: 'hadar2',
        email: 'j*****e@blah.com',
        mobile: '+22222222222',
      }),
    )
  })

  it('gets private profile', async () => {
    await Promise.all([
      userStorage.setProfileField('mobile', '+22222222222', 'public'),
      userStorage.setProfileField('email', 'johndoe@blah.com', 'masked'),
      userStorage.setProfileField('username', 'hadar2', 'public'),
    ])

    const { isValid, getErrors, validate, ...privateProfile } = userStorage.getPrivateProfile()

    expect(privateProfile).toEqual(
      expect.objectContaining({
        username: 'hadar2',
        email: 'johndoe@blah.com',
        mobile: '+22222222222',
      }),
    )
  })

  it('update profile field uses privacy settings', async () => {
    // Making sure that privacy default is not override in other tests
    await Promise.all([
      userStorage.setProfileField('fullName', 'Old Name', 'public'),
      userStorage.setProfileField('mobile', '+22222222211', 'masked'),
      userStorage.setProfileField('email', 'new@domain.com', 'masked'),
    ])

    expect(userStorage.getFieldPrivacy('mobile')).toEqual('masked')
    expect(userStorage.getFieldPrivacy('email')).toEqual('masked')

    await userStorage.setProfile(getUserModel(profile), true)
    expect(userStorage.getProfile().username.display).toEqual('hadar2')

    checkPrivateProfile()
    checkDisplayProfile()
  })

  it(`update profile doesn't change privacy settings`, async () => {
    const email = 'johndoe@blah.com'
    const profile = { email, fullName: 'full name', mobile: '+22222222222' }

    await userStorage.setProfileField('email', email, 'public')

    await Promise.all([true, false].map(async asModel => {
      await userStorage.setProfile(asModel ? getUserModel(profile) : profile, true)

      expect(userStorage.getDisplayProfile().email).toBe(email)
    }))
  })

  it(`setting profile changes privacy settings`, async () => {
    const email = 'johndoe@blah.com'
    const profile = { email, fullName: 'full name', mobile: '+22222222222' }

    await userStorage.setProfileField('email', email, 'public')

    await Promise.all([true, false].map(async asModel => {
      await userStorage.setProfile(asModel ? getUserModel(profile) : profile)

      expect(userStorage.getDisplayProfile().email).toBe('******')
    }))
  })
})
