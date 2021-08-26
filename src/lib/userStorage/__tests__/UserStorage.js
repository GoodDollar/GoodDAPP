import UserPropertiesClass from '../../gundb/UserPropertiesClass'
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
    const res = await userStorage.getProfileFieldDisplayValue('username')
    expect(res).toEqual('testname')
  })

  it('updates realmdb field', async () => {
    await userStorage.setProfile({ username: 'testname' }, true)
    const res = await userStorage.getProfileFieldDisplayValue('username')
    expect(res).toEqual('testname')
  })

  it('sets profile field', async () => {
    await userStorage.setProfileField('username', 'testname', 'public')
    const res = await userStorage.getProfileFieldDisplayValue('username')
    expect(res).toEqual('testname')
  })

  it('update profile field', async () => {
    await userStorage.setProfileField('username', 'testname2', 'public')
    const res = await userStorage.getProfileFieldDisplayValue('username')
    expect(res).toEqual('testname2')
  })

  it('has default user properties', async () => {
    const res = await userStorage.userProperties.getAll()

    //firstvisitapp is initialized in userStorage init
    const expected = { ...UserPropertiesClass.defaultProperties, firstVisitApp: null }
    expect(expected).toEqual(expect.objectContaining(res))
  })

  it('set user property', async () => {
    const res = await userStorage.userProperties.set('test', true)
    expect(res).toBeTruthy()
  })

  it('get user property', async () => {
    let isMadeBackup = await userStorage.userProperties.get('isMadeBackup')
    expect(isMadeBackup).toBeFalsy()
    const res = await userStorage.userProperties.set('isMadeBackup', true)
    expect(res).toBeTruthy()
    isMadeBackup = await userStorage.userProperties.get('isMadeBackup')
    expect(isMadeBackup).toBeTruthy()
  })

  it('sets profile field private (encrypted)', async () => {
    await userStorage.setProfileField('email', 'testuser@google.com', 'private')
    const res = userStorage.getProfile().email
    expect(res).toEqual(expect.objectContaining({ privacy: 'private', display: '******' }))
  })

  it('gets profile field private (decrypted)', async () => {
    await userStorage.setProfileField('email', 'testuser2@google.com', 'private')
    const res = userStorage.getProfile().email.value
    expect(res).toEqual('testuser2@google.com')
  })

  it('returns object with undefined fullName for fake user identifier', async () => {
    const userProfile = await userStorage.getPublicProfile('fake')
    expect(userProfile).toBeNull()
  })

  //
  it('sets profile email field masked', async () => {
    await userStorage.setProfileField('email', 'johndoe@blah.com', 'masked')
    const res = userStorage.getProfile().email
    expect(res).toEqual(expect.objectContaining({ privacy: 'masked', display: 'j*****e@blah.com' }))
  })

  it('sets profile mobile field masked', async () => {
    await userStorage.setProfileField('mobile', '+972-50-7384928', 'masked')
    const res = userStorage.getProfile().mobile
    expect(res).toEqual(expect.objectContaining({ privacy: 'masked', display: '***********4928' }))
  })

  it('doesnt mask non email/phone profile fields', async () => {
    await userStorage.setProfileField('username', 'John Doe', 'masked')
    const res = userStorage.getProfile().username
    expect(res).toEqual(expect.objectContaining({ display: 'John Doe' }))
  })

  it('change profile field privacy to public', async () => {
    await userStorage.setProfileField('mobile', '+972-50-7384928', 'masked')
    const before = userStorage.getProfile().mobile
    expect(before).toMatchObject({ privacy: 'masked', display: '***********4928' })

    await userStorage.setProfileFieldPrivacy('mobile', 'public')
    const after = await userStorage.getProfile().mobile
    expect(after).toMatchObject({ privacy: 'public', display: '+972-50-7384928' })
  })

  it('change profile field privacy to private', async () => {
    await userStorage.setProfileFieldPrivacy('mobile', 'private')
    const res = await userStorage.getProfile().mobile
    expect(res).toEqual(expect.objectContaining({ privacy: 'private', display: '******' }))
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
    const profileData = {
      fullName: 'New Name',
      email: 'new@email.com',
      mobile: '+22222222222',
      username: 'hadar2',
    }
    const profile = getUserModel(profileData)
    const fieldsPrivacy = await Promise.all([
      userStorage.getFieldPrivacy('mobile'),
      userStorage.getFieldPrivacy('email'),
    ])
    expect(fieldsPrivacy).toEqual(['masked', 'masked'])
    await userStorage.setProfile(profile, true)
    const result = userStorage.getProfile().username.display
    expect(result).toEqual('hadar2')

    const checkPrivateProfile = () => {
      const { isValid, getErrors, validate, ...privateProfile } = userStorage.getPrivateProfile()
      expect(privateProfile).toMatchObject(profileData)
    }
    const checkDisplayProfile = () => {
      const { isValid, getErrors, validate, ...displayProfile } = userStorage.getDisplayProfile()
      expect(displayProfile).toMatchObject({
        fullName: 'New Name',
        email: 'n*w@email.com',
        mobile: '********2222',
        username: 'hadar2',
      })
    }
    checkPrivateProfile()
    checkDisplayProfile()
  })

  it(`update profile doesn't change privacy settings`, async () => {
    const email = 'johndoe@blah.com'
    await userStorage.setProfileField('email', email, 'public')
    await userStorage.setProfile(getUserModel({ email, fullName: 'full name', mobile: '+22222222222' }), true)

    const result = userStorage.getDisplayProfile()
    expect(result.email).toBe(email)
  })

  it(`setting profile changes privacy settings`, async () => {
    const email = 'johndoe@blah.com'
    await userStorage.setProfileField('email', email, 'public')
    await userStorage.setProfile({ email, fullName: 'full name', mobile: '+22222222222' })

    const result = userStorage.getDisplayProfile()
    expect(result.email).toBe('******')
  })
})
