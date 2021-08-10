//@flow
import { sha3 } from 'web3-utils'
import gun from '../../gundb'
type UserRecord = {
  identifier: string,
  fullName?: string,
  mobile?: string,
  email?: string,
  walletAddress?: string,
  jwt?: string,
  smsValidated?: boolean,
  isEmailConfirmed?: boolean,
  otp?: { code: number, expirationDate: number },
  emailVerification?: { code: string, expirationDate: number },
}

export const addUser = (user: UserRecord): Promise<boolean> => {
  return updateUser(user)
}

export const updateUser = async (user: UserRecord): Promise<boolean> => {
  const { identifier, email, mobile, walletAddress } = user

  //remove get('users') this will work well with the mock we do for getUserProfilePublickey
  //the get('users') index is no longer use and is insecure
  const usersCol = gun //.get('users')
  await usersCol.get(identifier).putAck(generateDisplayPrivacyUserProfile(user))

  const userId = usersCol.get(identifier)

  return Promise.all([
    setProfileFieldIndex(usersCol, userId, 'email', email),
    setProfileFieldIndex(usersCol, userId, 'mobile', mobile),
    setProfileFieldIndex(usersCol, userId, 'walletAddress', walletAddress),
  ]).then(r => true)
}

export const generateDisplayPrivacyUserProfile = (user: UserRecord) => {
  const { fullName, email, mobile } = user
  return {
    profile: {
      ...user,
      fullName: fullName ? { display: fullName, privacy: 'public' } : undefined,
      email: email ? { display: email, privacy: 'masked' } : undefined,
      mobile: mobile ? { display: mobile, privacy: 'masked' } : undefined,
    },
  }
}

export const setProfileFieldIndex = async (usersCol: any, userId: string, attr: string, value: ?string) => {
  let ack = null
  if (value) {
    ack = await gun
      .get(`users/by${attr}`)
      .get(sha3(value))
      .putAck(userId)
  }
  return ack
}
