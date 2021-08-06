import 'fake-indexeddb/auto'
import fromEntries from 'object.fromentries'
import { UserProfileStorage } from '../../userStorage/UserProfileStorage'
import { default as goodWallet } from '../../wallet/GoodWallet'
import getDB from '../../realmdb/RealmDB'
import AsyncStorage from '../../utils/asyncStorage'

fromEntries.shim()

jest.setTimeout(30000)

const profile = {
  avatar: {
    display: 'https://via.placeholder.com/150',
    value: 'https://via.placeholder.com/150',
    privacy: 'public',
  },
  email: {
    display: 'julian@gooddollar.org',
    value: 'julian@gooddollar.org',
    privacy: 'public',
  },
  fullName: {
    value: 'Julian Kobryński',
    display: 'Julian Kobryński',
    privacy: 'public',
  },
  mnemonic: {
    value: 'duty disorder rocket velvet later fabric scheme paddle remove phone target medal',
    display: 'duty disorder rocket velvet later fabric scheme paddle remove phone target medal',
    privacy: 'public',
  },
  username: {
    value: 'juliankobrynski',
    display: 'juliankobrynski',
    privacy: 'public',
  },
  mobile: {
    value: '+48507471353',
    display: '+48507471353',
    privacy: 'public',
  },
  walletAddress: {
    value: '0x740E22161DEEAa60b8b0b5cDAAA091534Ff21649',
    display: '0x740E22161DEEAa60b8b0b5cDAAA091534Ff21649',
    privacy: 'public',
  },
  smallAvatar: {
    display: 'https://via.placeholder.com/150',
    value: 'https://via.placeholder.com/150',
    privacy: 'public',
  },
}

const profileKeyValue = {
  avatar: 'https://via.placeholder.com/150',
  email: 'julian@gooddollar.org',
  fullName: 'Julian Kobryński',
  mnemonic: 'duty disorder rocket velvet later fabric scheme paddle remove phone target medal',
  username: 'juliankobrynski',
  mobile: '+48507471353',
  walletAddress: '0x740E22161DEEAa60b8b0b5cDAAA091534Ff21649',
  smallAvatar: 'https://via.placeholder.com/150',
}

describe('UserProfileStorage', () => {
  let userProfileStorage

  beforeAll(async () => {
    await AsyncStorage.setItem(
      'GD_jwt',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dnZWRJbkFzIjoiMHg1YjliNDlmZjM1ZmE4OWZkMWZiOWNmNGJmNTNkNmI1MDA5ZmVjNjgxIiwiZ2RBZGRyZXNzIjoiMHg3NDBlMjIxNjFkZWVhYTYwYjhiMGI1Y2RhYWEwOTE1MzRmZjIxNjQ5IiwicHJvZmlsZVB1YmxpY2tleSI6IjlZdFNlSXdELVN3Z080UVIxaHBobGt4dFhleUdESjFIX01PQ3pncWcwWEkuTDN3RTJZUkpOT3c0cUo1UFVST0lRNTk3OVR3RFlCcmFmZGUwTlFkXzFSUSIsImV4cCI6MTYyODYwMzEwNywiYXVkIjoicmVhbG1kYl93YWxsZXRfZGV2ZWxvcG1lbnQiLCJzdWIiOiIweDViOWI0OWZmMzVmYTg5ZmQxZmI5Y2Y0YmY1M2Q2YjUwMDlmZWM2ODEiLCJpYXQiOjE2Mjc5OTgzMDd9.lwXZxCQg0qr5K2EP_v_cDqAPv56lZ6_DYTd-cKjPvJs',
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

  it('should save profile to the db', async () => {
    await userProfileStorage.setProfile(profile)

    const encryptedProfile = await userProfileStorage.profiledb.getProfile()
    const { user_id, _id, ...fields } = encryptedProfile

    // Check if values were encrypted
    Object.keys(fields).forEach(key => {
      expect(profile[key].value).not.toEqual(encryptedProfile[key].value)
    })
  })

  it('should initialize and decrypt values', async () => {
    userProfileStorage.profile = {}
    expect(userProfileStorage.profile).toEqual({})
    await userProfileStorage.init()

    // Exclude user_id and id
    const { user_id, id, ...fields } = userProfileStorage.profile

    expect(await userProfileStorage._decryptProfileFields(await userProfileStorage.profiledb.getProfile())).toEqual(
      userProfileStorage.profile,
    )

    // // Check if values are the same as in the original object
    expect(fields).toEqual(profile)
  })

  it('should initialize without profile in db', async () => {
    jest.spyOn(userProfileStorage.profiledb, 'getProfile').mockImplementation(() => null)
    await userProfileStorage.init()
    expect(userProfileStorage.profile).toEqual({})
    expect(userProfileStorage.getProfile()).toEqual({})
  })

  it('should encrypt profile fields', async () => {
    const encrypted = await userProfileStorage._encryptProfileFields(profile)
    Object.keys(encrypted).forEach(key => {
      expect(profile[key].value).not.toEqual(encrypted[key].value)
    })
  })

  it('should decrypt profile fields', async () => {
    const encrypted = await userProfileStorage.profiledb.getProfile()
    const decrypted = await userProfileStorage._decryptProfileFields(encrypted)
    expect(decrypted).toEqual(profile)
  })

  it('should get users profile', async () => {
    await userProfileStorage.init()
    expect(userProfileStorage.getProfile()).not.toEqual({})
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
    await userProfileStorage.setProfile(profileKeyValue, true)
  })

  it('should set public profile field', async () => {
    const oldProfile = userProfileStorage.profile
    const username = 'johndoe321'
    await userProfileStorage.setProfileField('username', username)
    const newProfile = userProfileStorage.profile

    expect(newProfile.username).toEqual({
      display: username,
      value: username,
      privacy: 'public',
    })
    expect(newProfile.username).not.toEqual(oldProfile.username)
  })

  it('should set private profile field', async () => {
    const oldProfile = userProfileStorage.profile
    const username = 'johndoe123'
    await userProfileStorage.setProfileField('username', username, 'private')
    const newProfile = userProfileStorage.profile

    expect(newProfile.username).toEqual({
      display: '******',
      value: username,
      privacy: 'private',
    })
    expect(newProfile.username).not.toEqual(oldProfile.username)
  })

  it('should get prodile by wallet address', async () => {
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

  it('should get profile by email', async () => {
    const email = userProfileStorage.profile.email.display
    const foundProfile = await userProfileStorage.getPublicProfile('email', email)
    expect(foundProfile.email).toEqual(email)
  })

  it('should not get profile by invalid email', async () => {
    const email = '123123123'
    const foundProfile = await userProfileStorage.getPublicProfile('email', email)
    expect(foundProfile).toBeNull()
  })

  it('should get profile by full name', async () => {
    const fullName = userProfileStorage.profile.fullName.display

    // console.log('FULL NAME', fullName)
    const foundProfile = await userProfileStorage.getPublicProfile('fullName', fullName)
    expect(foundProfile.fullName).toEqual(fullName)
  })

  it('should not get profile by invalid full name', async () => {
    const fullName = ''
    const foundProfile = await userProfileStorage.getPublicProfile('fullName', fullName)
    expect(foundProfile).toBeNull()
  })

  it('should get profile by username', async () => {
    const username = userProfileStorage.profile.username.display
    const foundProfile = await userProfileStorage.getPublicProfile('username', username)
    expect(foundProfile.username).toEqual(username)
  })

  it('should not get profile by invalid username', async () => {
    const username = ''
    const foundProfile = await userProfileStorage.getPublicProfile('username', username)
    expect(foundProfile).toBeNull()
  })

  it('should get profile by mobile', async () => {
    const mobile = userProfileStorage.profile.mobile.display
    const foundProfile = await userProfileStorage.getPublicProfile('mobile', mobile)
    expect(foundProfile.mobile).toEqual(mobile)
  })

  it('should not get profile by invalid mobile', async () => {
    const mobile = 'abcabcabc'
    const foundProfile = await userProfileStorage.getPublicProfile('mobile', mobile)
    expect(foundProfile).toBeNull()
  })

  it('should not get profile by invalid field', async () => {
    const foundProfile = await userProfileStorage.getPublicProfile('', '')
    expect(foundProfile).toBeNull()
  })

  it('should get avatar value', () => {
    const avatar = userProfileStorage.getProfileFieldValue('avatar')
    expect(avatar).toEqual(userProfileStorage.profile.avatar.value)
  })

  it('should get email value', () => {
    const email = userProfileStorage.getProfileFieldValue('email')
    expect(email).toEqual(userProfileStorage.profile.email.value)
  })

  it('should get fullName value', () => {
    const fullName = userProfileStorage.getProfileFieldValue('fullName')
    expect(fullName).toEqual(userProfileStorage.profile.fullName.value)
  })

  it('should get mnemonic value', () => {
    const mnemonic = userProfileStorage.getProfileFieldValue('mnemonic')
    expect(mnemonic).toEqual(userProfileStorage.profile.mnemonic.value)
  })

  it('should get username value', () => {
    const username = userProfileStorage.getProfileFieldValue('username')
    expect(username).toEqual(userProfileStorage.profile.username.value)
  })

  it('should get mobile value', () => {
    const mobile = userProfileStorage.getProfileFieldValue('mobile')
    expect(mobile).toEqual(userProfileStorage.profile.mobile.value)
  })

  it('should get walletAddress value', () => {
    const walletAddress = userProfileStorage.getProfileFieldValue('walletAddress')
    expect(walletAddress).toEqual(userProfileStorage.profile.walletAddress.value)
  })

  it('should get smallAvatar value', () => {
    const smallAvatar = userProfileStorage.getProfileFieldValue('smallAvatar')
    expect(smallAvatar).toEqual(userProfileStorage.profile.smallAvatar.value)
  })

  it('should not get invalid value from profile', () => {
    const value = userProfileStorage.getProfileFieldValue('abc')
    expect(value).toEqual(undefined)
  })

  it('should get email display value', () => {
    const email = userProfileStorage.getProfileFieldDisplayValue('email')
    expect(email).toEqual(userProfileStorage.profile.email.value)
  })

  it('should get fullName display value', () => {
    const fullName = userProfileStorage.getProfileFieldDisplayValue('fullName')
    expect(fullName).toEqual(userProfileStorage.profile.fullName.value)
  })

  it('should get mnemonic display value', () => {
    const mnemonic = userProfileStorage.getProfileFieldDisplayValue('mnemonic')
    expect(mnemonic).toEqual(userProfileStorage.profile.mnemonic.value)
  })

  it('should get username display value', () => {
    const username = userProfileStorage.getProfileFieldDisplayValue('username')
    expect(username).toEqual(userProfileStorage.profile.username.value)
  })

  it('should get mobile display value', () => {
    const mobile = userProfileStorage.getProfileFieldDisplayValue('mobile')
    expect(mobile).toEqual(userProfileStorage.profile.mobile.value)
  })

  it('should get walletAddress display value', () => {
    const walletAddress = userProfileStorage.getProfileFieldDisplayValue('walletAddress')
    expect(walletAddress).toEqual(userProfileStorage.profile.walletAddress.value)
  })

  it('should get smallAvatar display value', () => {
    const smallAvatar = userProfileStorage.getProfileFieldDisplayValue('smallAvatar')
    expect(smallAvatar).toEqual(userProfileStorage.profile.smallAvatar.value)
  })

  it('should not get display value for invalid field', () => {
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
      avatar: {
        display: '',
        value: '',
        privacy: '',
      },
      email: {
        display: '',
        value: '',
        privacy: '',
      },
      fullName: {
        value: '',
        display: '',
        privacy: '',
      },
      mnemonic: {
        value: '',
        display: '',
        privacy: '',
      },
      username: {
        value: '',
        display: '',
        privacy: '',
      },
      mobile: {
        value: '',
        display: '',
        privacy: '',
      },
      walletAddress: {
        value: '',
        display: '',
        privacy: '',
      },
      smallAvatar: {
        display: '',
        value: '',
        privacy: '',
      },
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
  })

  it('should set profile field to masked', async () => {
    await userProfileStorage.setProfileFieldPrivacy('email', 'masked')
    expect(userProfileStorage.getFieldPrivacy('email')).toEqual('masked')
  })

  it('should set profile field to public', async () => {
    await userProfileStorage.setProfileFieldPrivacy('email', 'public')
    expect(userProfileStorage.getFieldPrivacy('email')).toEqual('public')
  })

  it('should find profile using getUserProfile with valid email', async () => {
    const foundProfile = await userProfileStorage.getUserProfile(userProfileStorage.profile.email.value)
    expect(foundProfile).toEqual(expect.objectContaining({ name: userProfileStorage.profile.fullName.value }))
  })

  it('should find profile using getUserProfile with valid mobile', async () => {
    const foundProfile = await userProfileStorage.getUserProfile(userProfileStorage.profile.mobile.value)
    expect(foundProfile).toEqual(expect.objectContaining({ name: userProfileStorage.profile.fullName.value }))
  })

  it('should find profile using getUserProfile with valid walletAddress', async () => {
    const foundProfile = await userProfileStorage.getUserProfile(userProfileStorage.profile.walletAddress.value)
    expect(foundProfile).toEqual(expect.objectContaining({ name: userProfileStorage.profile.fullName.value }))
  })

  // it('should not find profile using getUserProfile with invalid email', async () => {
  //   const foundProfile = await userProfileStorage.getUserProfile('123123123')
  //   console.log(foundProfile)
  //   // expect(foundProfile).toEqual(expect.objectContaining({ name: userProfileStorage.profile.fullName.value }))
  // })

  // it('should delete profile', async () => {
  //   await userProfileStorage.deleteProfile()

  //   // await userProfileStorage.init()
  //   // console.log(userProfileStorage.profile)
  //   expect(userProfileStorage.profile).toEqual({})
  // })
})
