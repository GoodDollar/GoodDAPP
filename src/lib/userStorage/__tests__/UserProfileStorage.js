import 'fake-indexeddb/auto'
import fromEntries from 'object.fromentries'
import { forIn, isFunction, isNil, omitBy } from 'lodash'

import getDB from '../../realmdb/RealmDB'
import AsyncStorage from '../../utils/asyncStorage'
import { default as goodWallet } from '../../wallet/GoodWallet'

import { UserProfileStorage } from '../UserProfileStorage'

fromEntries.shim()
jest.setTimeout(30000)

describe('UserProfileStorage', () => {
  let userProfileStorage

  const profile = {
    email: 'julian@gooddollar.org',
    fullName: 'Julian Kobryński',
    mnemonic: 'duty disorder rocket velvet later fabric scheme paddle remove phone target medal',
    username: 'juliankobrynski',
    mobile: '+48507471353',
    walletAddress: '0x740E22161DEEAa60b8b0b5cDAAA091534Ff21649',
  }

  const emptyProfile = {
    avatar: '',
    email: '',
    fullName: '',
    mnemonic: '',
    username: '',
    mobile: '',
    walletAddress: '',
    smallAvatar: '',
  }

  const iterateUserModel = (profile, callback) => forIn(omitBy(profile, isFunction), callback)

  beforeAll(async () => {
    await AsyncStorage.setItem(
      'GD_jwt',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dnZWRJbkFzIjoiMHg1YjliNDlmZjM1ZmE4OWZkMWZiOWNmNGJmNTNkNmI1MDA5ZmVjNjgxIiwiZ2RBZGRyZXNzIjoiMHg3NDBlMjIxNjFkZWVhYTYwYjhiMGI1Y2RhYWEwOTE1MzRmZjIxNjQ5IiwicHJvZmlsZVB1YmxpY2tleSI6IjlZdFNlSXdELVN3Z080UVIxaHBobGt4dFhleUdESjFIX01PQ3pncWcwWEkuTDN3RTJZUkpOT3c0cUo1UFVST0lRNTk3OVR3RFlCcmFmZGUwTlFkXzFSUSIsImV4cCI6MTYyOTA5Njg3MSwiYXVkIjoicmVhbG1kYl93YWxsZXRfZGV2ZWxvcG1lbnQiLCJzdWIiOiIweDViOWI0OWZmMzVmYTg5ZmQxZmI5Y2Y0YmY1M2Q2YjUwMDlmZWM2ODEiLCJpYXQiOjE2Mjg0OTIwNzF9.foR0GWU-63uJ4JIx1wBKgHs8FYVUNJvkirTWj-VCWGU',
    )

    await goodWallet.ready

    const db = getDB()
    const seed = goodWallet.wallet.eth.accounts.wallet[goodWallet.getAccountForType('gundb')].privateKey.slice(2)

    await db.init(seed, goodWallet.getAccountForType('gundb')) // only once user is registered he has access to realmdb via signed jwt
    userProfileStorage = new UserProfileStorage(goodWallet, db)
  })

  beforeEach(async () => {
    jest.restoreAllMocks()

    // Reset profile
    await userProfileStorage.setProfile(profile, true)
  })

  it('should not save invalid profiles', async () => {
    const { email, username, ...fields } = profile

    // mobile is not mandatory
    const invalidProfiles = [{ username, email: '', ...fields }, { email, username: '', ...fields }]

    const errorMessages = ['Email is required', 'Username cannot be empty']
    const missingFields = ['email', 'username']

    await Promise.all(
      invalidProfiles.map(async (item, index) => {
        const message = errorMessages[index]
        const fieldName = missingFields[index]

        // it seems toThrow is stictly checking rejected with value to be an exception
        // se we'll check only for rejection and for validation message
        await expect(userProfileStorage.setProfile(item)).rejects.toHaveProperty(fieldName, message)
      }),
    )
  })

  it('should save profile to the db', async () => {
    const { user_id, _id, ...fields } = await userProfileStorage.profiledb.getProfile()

    // we calling setProfile in beforeEach so no need to do it again here

    expect(user_id).not.toBeNull()
    expect(_id).not.toBeNull()

    for (const key in fields) {
      expect(profile[key]).toEqual(fields[key].display)
    }
  })

  it('should store encrypted values in the db', async () => {
    const { user_id, _id, ...fields } = await userProfileStorage.profiledb.getProfile()

    for (const key in fields) {
      expect(profile[key]).not.toEqual(fields[key].value)
      expect(fields[key].value.length).toBeGreaterThan(0)
    }
  })

  it('should initialize and decrypt values', async () => {
    userProfileStorage.profile = {}
    await userProfileStorage.init()

    expect(userProfileStorage.getProfile()).toEqual(expect.objectContaining(profile))
  })

  it('should initialize without profile in db', async () => {
    jest.spyOn(userProfileStorage.profiledb, 'getProfile').mockImplementation(() => null)

    await userProfileStorage.init()
    expect(Object.values(userProfileStorage.getProfile()).every(isNil)).toBeTruthy()
  })

  it('should decrypt profile fields', async () => {
    const encrypted = await userProfileStorage.profiledb.getProfile()
    const decrypted = await userProfileStorage._decryptProfileFields(encrypted)

    for (const key in profile) {
      expect(profile[key]).toEqual(decrypted[key].value)
    }
  })

  it('should decrypt invalid or empty profile', async () => {
    const invalidProfiles = [null, undefined, false]

    await Promise.all(
      invalidProfiles.map(async item => {
        await expect(userProfileStorage._decryptProfileFields(item)).resolves.toEqual({})
      }),
    )
  })

  it('should set multiple profile fields', async () => {
    const oldProfile = userProfileStorage.profile
    const fieldsToUpdate = {
      fullName: {
        value: 'John Doe',
        display: 'John Doe',
        privacy: 'public',
      },
      username: {
        value: 'johndoe123',
        display: 'johndoe123',
        privacy: 'public',
      },
    }

    await userProfileStorage.setProfileFields(fieldsToUpdate)
    const newProfile = userProfileStorage.profile

    expect(newProfile).not.toEqual(oldProfile)

    for (const key in fieldsToUpdate) {
      expect(fieldsToUpdate[key].value).toEqual(newProfile[key].value)
    }
  })

  it('should set private profile field', async () => {
    const username = 'johndoe123'
    const fieldValue = {
      display: '******',
      value: username,
      privacy: 'private',
    }

    await userProfileStorage.setProfileField('username', username, 'private')
    expect(userProfileStorage.profile.username).toEqual(fieldValue)
  })

  it('should set public profile field', async () => {
    const username = 'johndoe321'

    await userProfileStorage.setProfileField('username', username)
    expect(userProfileStorage.getProfile().username).toEqual(username)
  })

  it('should throw error for invalid privacy setting', async () => {
    // sync functions are wrapped onto callback
    await expect(() => userProfileStorage.setProfileField('username', 'johndoe1111', '123123123')).toThrow(
      'Invalid privacy setting',
    )
  })

  it('should get profile by wallet address', async () => {
    const usersProfile = await userProfileStorage.profiledb.getProfile()
    const foundProfile = await userProfileStorage.getProfileByWalletAddress(
      userProfileStorage.profile.walletAddress.display,
    )

    // Check if correct profile was found
    expect(foundProfile.user_id).toEqual(usersProfile.user_id)
  })

  it('should not find a wallet with invalid address', async () => {
    const foundProfile = await userProfileStorage.getProfileByWalletAddress('123123123')

    expect(foundProfile).toBeNull()
  })

  it('should get public profile by valid field', async () => {
    const email = userProfileStorage.profile.email.display
    const foundProfile = await userProfileStorage.getPublicProfile('email', email)

    expect(foundProfile.username).toEqual(userProfileStorage.profile.username.display)
  })

  it('should not get public profile by invalid field', async () => {
    const email = '123123123'
    const foundProfile = await userProfileStorage.getPublicProfile('email', email)

    expect(foundProfile).toBeNull()
  })

  it('should get profile field value & display value', () => {
    const { value, display } = userProfileStorage.profile.email

    expect([
      userProfileStorage.getProfileFieldDisplayValue('email'),
      userProfileStorage.getProfileFieldValue('email'),
    ]).toEqual([display, value])
  })

  it('should not get profile field value & display value for invalid field', () => {
    expect(userProfileStorage.getProfileFieldValue('abc')).not.toBeDefined()
    expect(userProfileStorage.getProfileFieldDisplayValue('abc')).not.toBeDefined()
  })

  it('should get display profile', () => {
    const displayProfile = userProfileStorage.getDisplayProfile()
    const { profile } = userProfileStorage

    iterateUserModel(displayProfile, (display, key) => {
      expect(display).toEqual(profile[key].display)
    })
  })

  it('should get private profile', () => {
    const privateProfile = userProfileStorage.getPrivateProfile()
    const { profile } = userProfileStorage

    iterateUserModel(privateProfile, (value, key) => {
      expect(value).toEqual(profile[key].value)
    })
  })

  it('should get fields privacy', () => {
    for (const key in userProfileStorage.profile) {
      expect(userProfileStorage.profile[key].privacy).toEqual(userProfileStorage.getFieldPrivacy(key))
    }
  })

  it('should pass profile validation', async () => {
    const { isValid, errors } = await userProfileStorage.validateProfile(profile)

    expect(isValid).toBeTruthy()
    expect(errors).toEqual({})
  })

  it('should fail profile validation with empty profile', async () => {
    const { isValid, errors } = await userProfileStorage.validateProfile()

    expect(isValid).toBeFalsy()
    expect(errors).toEqual({})
  })

  it('should fail profile validation with email error', async () => {
    const { isValid, errors } = await userProfileStorage.validateProfile(emptyProfile)
    const errorMessages = {
      email: 'Unavailable email',
      mnemonic: 'Unavailable mnemonic',
      username: 'Unavailable username',
      mobile: 'Unavailable mobile',
      walletAddress: 'Unavailable walletAddress',
    }

    expect(isValid).toBeFalsy()

    forIn(errorMessages, (message, field) => {
      expect(errors).toHaveProperty(field, message)
    })
  })

  it('should set profile field to private', async () => {
    await userProfileStorage.setProfileFieldPrivacy('email', 'private')

    expect(userProfileStorage.getFieldPrivacy('email')).toEqual('private')
    expect(userProfileStorage.getProfileFieldDisplayValue('email')).toEqual('******')
  })

  it('should set profile field to masked', async () => {
    await userProfileStorage.setProfileFieldPrivacy('email', 'masked')

    expect(userProfileStorage.getFieldPrivacy('email')).toEqual('masked')
    expect(userProfileStorage.getProfileFieldDisplayValue('email')).toContain('j****n')
  })

  it('should set profile field to public', async () => {
    await userProfileStorage.setProfileFieldPrivacy('email', 'public')

    expect(userProfileStorage.getFieldPrivacy('email')).toEqual('public')
    expect(userProfileStorage.getProfileFieldValue('email')).toEqual(
      userProfileStorage.getProfileFieldDisplayValue('email'),
    )
  })

  it('should find profile using getUserProfile with valid email', async () => {
    const foundProfile = await userProfileStorage.getUserProfile(userProfileStorage.profile.email.value)

    expect(foundProfile).toHaveProperty('name', userProfileStorage.profile.fullName.value)
  })

  it('should not find profile using getUserProfile with invalid value', async () => {
    const foundProfile = await userProfileStorage.getUserProfile('as123asdas12312a')

    expect(Object.values(foundProfile).every(isNil)).toBeTruthy()
  })

  it('should delete profile', async () => {
    await userProfileStorage.deleteProfile()
    await userProfileStorage.init()

    const profileInDb = await userProfileStorage.profiledb.getProfile()

    expect(profileInDb).toBeNull()
  })
})
