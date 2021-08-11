import 'fake-indexeddb/auto'
import fromEntries from 'object.fromentries'
import { UserProfileStorage } from '../../userStorage/UserProfileStorage'
import { default as goodWallet } from '../../wallet/GoodWallet'
import getDB from '../../realmdb/RealmDB'
import AsyncStorage from '../../utils/asyncStorage'

fromEntries.shim()

jest.setTimeout(30000)

const profile = {
  email: 'julian@gooddollar.org',
  fullName: 'Julian Kobryński',
  mnemonic: 'duty disorder rocket velvet later fabric scheme paddle remove phone target medal',
  username: 'juliankobrynski',
  mobile: '+48507471353',
  walletAddress: '0x740E22161DEEAa60b8b0b5cDAAA091534Ff21649',
  avatar: 'bafkreicekhneo55iwdxr5imxac6g4duid6atnj5mmx35y7fhkodjzovrze',
  smallAvatar: 'bafkreief77r6pciejdilymrqrvt77gve6zluleleqz55og3yuqseelxppi',
}

describe('UserProfileStorage', () => {
  let userProfileStorage

  beforeAll(async () => {
    await AsyncStorage.setItem(
      'GD_jwt',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dnZWRJbkFzIjoiMHg1YjliNDlmZjM1ZmE4OWZkMWZiOWNmNGJmNTNkNmI1MDA5ZmVjNjgxIiwiZ2RBZGRyZXNzIjoiMHg3NDBlMjIxNjFkZWVhYTYwYjhiMGI1Y2RhYWEwOTE1MzRmZjIxNjQ5IiwicHJvZmlsZVB1YmxpY2tleSI6IjlZdFNlSXdELVN3Z080UVIxaHBobGt4dFhleUdESjFIX01PQ3pncWcwWEkuTDN3RTJZUkpOT3c0cUo1UFVST0lRNTk3OVR3RFlCcmFmZGUwTlFkXzFSUSIsImV4cCI6MTYyOTA5Njg3MSwiYXVkIjoicmVhbG1kYl93YWxsZXRfZGV2ZWxvcG1lbnQiLCJzdWIiOiIweDViOWI0OWZmMzVmYTg5ZmQxZmI5Y2Y0YmY1M2Q2YjUwMDlmZWM2ODEiLCJpYXQiOjE2Mjg0OTIwNzF9.foR0GWU-63uJ4JIx1wBKgHs8FYVUNJvkirTWj-VCWGU',
    )
    const db = getDB()
    await goodWallet.ready
    userProfileStorage = new UserProfileStorage(goodWallet, db)
    const seed = goodWallet.wallet.eth.accounts.wallet[goodWallet.getAccountForType('gundb')].privateKey.slice(2)
    await db.init(seed, goodWallet.getAccountForType('gundb')) //only once user is registered he has access to realmdb via signed jwt
  })

  beforeEach(() => {
    jest.restoreAllMocks()
  })

  it('should not save profile without email to the db', async () => {
    const { email, ...fields } = profile

    try {
      await userProfileStorage.setProfile(fields)
    } catch (exception) {
      expect(exception).toEqual(expect.objectContaining({ email: 'Email is required' }))
    }
  })

  it('should not save profile without mobile to the db', async () => {
    const { mobile, ...fields } = profile

    try {
      await userProfileStorage.setProfile(fields)
    } catch (exception) {
      expect(exception).toEqual(expect.objectContaining({ mobile: 'Mobile is required' }))
    }
  })

  it('should not save profile without username to the db', async () => {
    const { username, ...fields } = profile

    try {
      await userProfileStorage.setProfile(fields)
    } catch (exception) {
      expect(exception).toEqual(expect.objectContaining({ username: 'Username is required' }))
    }
  })

  it('should save profile to the db', async () => {
    await userProfileStorage.setProfile(profile)
    const { user_id, _id, ...fields } = await userProfileStorage.profiledb.getProfile()

    expect(user_id).not.toBeNull()
    expect(_id).not.toBeNull()
    Object.keys(fields).forEach(key => {
      const privacy = fields[key].privacy
      if (privacy === 'public') {
        expect(profile[key]).toEqual(fields[key].display)
      } else {
        expect(fields[key].display).toEqual('******')
      }
    })
  })

  it('should store encrypted values in the db', async () => {
    const { user_id, _id, ...fields } = await userProfileStorage.profiledb.getProfile()

    Object.keys(fields).forEach(key => {
      expect(profile[key]).not.toEqual(fields[key].value)
      expect(fields[key].value.length).toBeGreaterThan(0)
    })
  })

  it('should initialize and decrypt values', async () => {
    userProfileStorage.profile = {}
    expect(userProfileStorage.profile).toEqual({})
    await userProfileStorage.init()

    expect(userProfileStorage.getProfile()).toEqual(expect.objectContaining(profile))
  })

  it('should initialize without profile in db', async () => {
    jest.spyOn(userProfileStorage.profiledb, 'getProfile').mockImplementation(() => null)
    await userProfileStorage.init()
    expect(Object.values(userProfileStorage.getProfile()).every(v => v === null)).toBeTruthy()
  })

  it('should decrypt profile fields', async () => {
    const encrypted = await userProfileStorage.profiledb.getProfile()
    const decrypted = await userProfileStorage._decryptProfileFields(encrypted)
    Object.keys(profile).forEach(key => {
      expect(profile[key]).toEqual(decrypted[key].value)
    })
  })

  it('should decrypt invalid or empty profile', async () => {
    const invalidProfiles = [null, undefined, false]
    const decrypted = await Promise.all(invalidProfiles.map(item => userProfileStorage._decryptProfileFields(item)))
    decrypted.forEach(item => expect(item).toEqual({}))
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
    Object.keys(fieldsToUpdate).forEach(key => {
      expect(fieldsToUpdate[key].value).toEqual(newProfile[key].value)
    })

    // Reset profile
    await userProfileStorage.setProfile(profile, true)
  })

  it('should set private profile field', async () => {
    const username = 'johndoe123'
    await userProfileStorage.setProfileField('username', username, 'private')
    const newProfile = userProfileStorage.profile

    expect(newProfile.username).toEqual({
      display: '******',
      value: username,
      privacy: 'private',
    })
  })

  it('should set public profile field', async () => {
    const username = 'johndoe321'
    await userProfileStorage.setProfileField('username', username)

    expect(userProfileStorage.getProfile().username).toEqual(username)
  })

  it('should throw error for invalid privacy setting', async () => {
    try {
      await userProfileStorage.setProfileField('username', 'johndoe1111', '123123123')
    } catch (exception) {
      expect(exception.message).toEqual('Invalid privacy setting')
    }
  })

  it('should get profile by wallet address', async () => {
    // Reset profile
    await userProfileStorage.setProfile(profile, true)
    const foundProfile = await userProfileStorage.getProfileByWalletAddress(
      userProfileStorage.profile.walletAddress.display,
    )
    const usersProfile = await userProfileStorage.profiledb.getProfile()

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

  it('should get profile field value', () => {
    const email = userProfileStorage.getProfileFieldValue('email')
    expect(email).toEqual(userProfileStorage.profile.email.value)
  })

  it('should not get profile value for invalid field', () => {
    const value = userProfileStorage.getProfileFieldValue('abc')
    expect(value).toEqual(undefined)
  })

  it('should get private profile field display value', () => {
    const email = userProfileStorage.getProfileFieldDisplayValue('email')
    expect(email).toEqual('******')
  })

  it('should get public profile field display value', () => {
    const email = userProfileStorage.getProfileFieldDisplayValue('username')
    expect(email).toEqual(userProfileStorage.profile.username.value)
  })

  it('should not get profile field display value for invalid field', () => {
    const value = userProfileStorage.getProfileFieldDisplayValue('abc')
    expect(value).toEqual(undefined)
  })

  it('should get display profile', () => {
    const displayProfile = userProfileStorage.getDisplayProfile()
    const { profile } = userProfileStorage
    Object.keys(displayProfile).forEach(key => {
      if (typeof displayProfile[key] !== 'function') {
        expect(displayProfile[key]).toEqual(profile[key].display)
      }
    })
  })

  it('should get private profile', () => {
    const privateProfile = userProfileStorage.getPrivateProfile()
    const { profile } = userProfileStorage
    Object.keys(privateProfile).forEach(key => {
      if (typeof privateProfile[key] !== 'function') {
        expect(privateProfile[key]).toEqual(profile[key].value)
      }
    })
  })

  it('should get fields privacy', () => {
    Object.keys(userProfileStorage.profile).forEach(key => {
      expect(userProfileStorage.profile[key].privacy).toEqual(userProfileStorage.getFieldPrivacy(key))
    })
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
    const { isValid, errors } = await userProfileStorage.validateProfile({
      avatar: '',
      email: '',
      fullName: '',
      mnemonic: '',
      username: '',
      mobile: '',
      walletAddress: '',
      smallAvatar: '',
    })

    // console.log(errors)
    expect(isValid).toBeFalsy()
    expect(errors).toEqual(expect.objectContaining({ email: 'Unavailable email' }))
    expect(errors).toEqual(expect.objectContaining({ mnemonic: 'Unavailable mnemonic' }))
    expect(errors).toEqual(expect.objectContaining({ username: 'Unavailable username' }))
    expect(errors).toEqual(expect.objectContaining({ mobile: 'Unavailable mobile' }))
    expect(errors).toEqual(expect.objectContaining({ walletAddress: 'Unavailable walletAddress' }))
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
    expect(foundProfile).toEqual(expect.objectContaining({ name: userProfileStorage.profile.fullName.value }))
  })

  it('should not find profile using getUserProfile with invalid value', async () => {
    const foundProfile = await userProfileStorage.getUserProfile('as123asdas12312a')
    expect(Object.values(foundProfile).every(key => key == null)).toBeTruthy()
  })

  it('should delete profile', async () => {
    await userProfileStorage.deleteProfile()
    await userProfileStorage.init()

    const profileInDb = await userProfileStorage.profiledb.getProfile()
    expect(profileInDb).toBeNull()
  })
})
