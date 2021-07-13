import avatarStorage from '../gundb/UserAvatarStorage'

import { asImageRecord, isValidBase64Image } from '../utils/image'
import { isValidCID } from '../utils/ipfs'

export const loadIfRawBase64 = async cid => {
  if (!isValidCID(cid)) {
    throw new Error('Not a valid CID')
  }

  const metadata = await avatarStorage.loadMetadata(cid)

  if (false !== metadata) {
    return
  }

  return avatarStorage.loadAvatar(cid)
}

export const updateFeedEventAvatar = async avatar => {
  try {
    let avatarRecord

    if (isValidBase64Image(avatar)) {
      avatarRecord = asImageRecord(avatar)
    } else {
      avatarRecord = await loadIfRawBase64(avatar)
    }

    if (avatarRecord) {
      const smallAvatar = { ...avatarRecord }

      return await avatarStorage.storeAvatars(avatarRecord, smallAvatar)
    }
  } catch {
    return avatar
  }
}
