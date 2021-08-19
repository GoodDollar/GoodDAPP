import { forIn, isFunction, isNil, omitBy } from 'lodash'

import { UserProfileStorage } from '../UserProfileStorage'
import userStorage from '../UserStorage'
import { initUserStorage } from './__util__'

jest.setTimeout(30000)

describe('UserProfileStorage', () => {
  let userProfileStorage
  let goodWallet

  const profile = {
    email: 'julian@gooddollar.org',
    fullName: 'Julian Kobryński',
    mnemonic: 'duty disorder rocket velvet later fabric scheme paddle remove phone target medal',
    username: 'juliankobrynski',
    mobile: '+48507471353',
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
    await initUserStorage()

    const { wallet, feedDB, profilePrivateKey } = userStorage

    userProfileStorage = new UserProfileStorage(wallet, feedDB, profilePrivateKey)
    goodWallet = wallet
  })

  beforeEach(async () => {
    jest.restoreAllMocks()

    // Reset profile
    await userProfileStorage.setProfile(profile, true)
  })

  it('should save any value', async () => {
    const { email, username, mobile, ...fields } = profile

    // mobile is not mandatory
    const invalidProfiles = [
      { username, mobile, ...fields },
      { username, mobile, email: 'abc', ...fields },
      { email, mobile, username: '', ...fields },
      { email, mobile, username: 'John Doe', ...fields },
    ]

    await Promise.all(
      invalidProfiles.map(async (item, index) => {
        await expect(userProfileStorage.setProfile(item)).resolves
      }),
    )
  })

  it('should save profile to the db', async () => {
    // Has to be here
    // setProfile with update: true in beforeEach won't work with no profile in db
    // setProfile has to be successfully called with update: false at least once
    await userProfileStorage.setProfile(profile)
    const { user_id, _id, publicKey, index, walletAddress, ...fields } = await userProfileStorage.profiledb.getProfile()

    // we calling setProfile in beforeEach so no need to do it again here

    expect(user_id).not.toBeNull()
    expect(_id).not.toBeNull()

    expect(publicKey).toEqual(userProfileStorage.privateKey.public.toString())
    expect(walletAddress.display).toEqual(goodWallet.account)
    expect(index.walletAddress.hash).toEqual(goodWallet.wallet.utils.sha3(goodWallet.account.toLowerCase()))
    for (const key in fields) {
      const field = fields[key]
      if (!field.privacy) {
        continue
      } //skip non profile fields
      if (field.privacy === 'public') {
        expect(profile[key]).toEqual(field.display)
      } else {
        expect(field.display).toEqual('******')
      }
    }
  })

  it('should store encrypted values in the db', async () => {
    const { user_id, _id, ...fields } = await userProfileStorage.profiledb.getProfile()

    for (const key in fields) {
      if (!fields[key].value) {
        continue
      } //skip non core profile fields
      expect(profile[key]).not.toEqual(fields[key].value)
      expect(fields[key].value.length).toBeGreaterThan(0)
    }
  })

  it('should initialize and decrypt values', async () => {
    userProfileStorage.profile = {}
    await userProfileStorage.init()

    expect(userProfileStorage.getPrivateProfile()).toEqual(expect.objectContaining(profile))
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
      fullName: 'John Doe',
      username: 'johndoe123',
    }
    await userProfileStorage.setProfile(fieldsToUpdate, true)

    const updatedProfile = userProfileStorage.profile

    await userProfileStorage.init()
    const refreshedProfile = userProfileStorage.profile

    expect(updatedProfile).not.toEqual(oldProfile)
    for (const key in fieldsToUpdate) {
      expect(fieldsToUpdate[key]).toEqual(updatedProfile[key].value)
      expect(fieldsToUpdate[key]).toEqual(refreshedProfile[key].value)
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
    expect(userProfileStorage.getProfile().username.value).toEqual(username)
  })

  it('should throw error for invalid privacy setting', async () => {
    // sync functions should be wrapped onto callback instead of .resolve/.reject wrapper
    await expect(() => userProfileStorage.setProfileField('username', 'johndoe1111', '123123123')).toThrow(
      'Invalid privacy setting',
    )
  })

  it('should get profile by wallet address', async () => {
    const usersProfile = await userProfileStorage.profiledb.getProfile()

    const foundProfile = await userProfileStorage.getProfileByWalletAddress(goodWallet.account)

    // Check if correct profile was found
    expect(foundProfile.username).toEqual(usersProfile.username.display)
  })

  it('should not find a wallet with invalid address', async () => {
    const foundProfile = await userProfileStorage.getProfileByWalletAddress('0x111')

    expect(foundProfile).toBeNull()
  })

  it('should get public profile by wallet adddress', async () => {
    const foundProfile = await userProfileStorage.getPublicProfile('walletAddress', goodWallet.account)

    expect(foundProfile.walletAddress).toEqual(goodWallet.account)
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

  it('should fail profile validation with error', async () => {
    const { isValid, errors } = await userProfileStorage.validateProfile(emptyProfile)

    const errorMessages = {
      email: 'Unavailable email',
      username: 'Unavailable username',
      mobile: 'Unavailable mobile',
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

  it('should not find profile using getUserProfile with invalid value', async () => {
    const foundProfile = await userProfileStorage.getPublicProfile('as123asdas12312a')

    expect(foundProfile).toBeNull()
  })

  it('should delete profile', async () => {
    await userProfileStorage.deleteProfile()
    await userProfileStorage.init()

    const profileInDb = await userProfileStorage.profiledb.getProfile()

    expect(profileInDb).toBeNull()
  })
})
