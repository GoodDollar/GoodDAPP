import { isString } from 'lodash'

import userStorage from '../gundb/UserStorage'
import { isValidBase64Image } from '../utils/image'

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
    await userStorage.setAvatar(avatar)
  } else {
    // if already cid - check is cid valid and exists, set null (delete avatar) if fails
    try {
      const base64 = await userStorage.loadAvatar(avatar, true)

      if (!base64) {
        throw new Error('Not a valid CID')
      }
    } catch {
      await userStorage.removeAvatar()
    }
  }
}
export default { fromDate, update: uploadAvatars, key: 'uploadAvatars' }
