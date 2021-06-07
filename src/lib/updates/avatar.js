import { isString } from 'lodash'

import userStorage from '../gundb/UserStorage'
import Base64Storage from '../nft/Base64Storage'
import AsyncStorage from '../utils/asyncStorage'

import { isValidBase64Image, isValidCIDImage } from '../utils/image'

const fromDate = new Date('2021/06/04')

/**
 * set status to broken send feed
 * @returns {Promise<void>}
 */
const uploadAvatars = async (lastUpdate, prevVersion, log) => {
  const avatar = await userStorage.getProfileFieldValue('avatar')

  // if empty - do nothing
  if (!isString(avatar)) {
    return
  }

  // if still base64 - re-set avatar, userStorage will resize & upload
  // both avatar and smallAvatar it and store theirs CIDs in the GunDB
  if (isValidBase64Image(avatar)) {
    await userStorage.setAvatar(avatar, true)
  } else {
    // if already cid - check is cid valid and exists, set null (delete avatar) if fails
    try {
      if (!isValidCIDImage(avatar)) {
        throw new Error('Not a valid CID')
      }

      await Base64Storage.loadAvatar(avatar, true)
    } catch {
      await userStorage.removeAvatar(true)
    }
  }

  // cleanup feed to re-upload other user avatars during feed pages loading
  // reuploading all the avatars cached in the feed here could take a lot of time
  // so let users would do it by themselves time by time while scrolling
  await AsyncStorage.removeItem('GD_feed')
}
export default { fromDate, update: uploadAvatars, key: 'uploadAvatars' }
