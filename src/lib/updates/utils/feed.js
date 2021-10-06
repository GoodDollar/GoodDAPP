import { isString } from 'lodash'

import { isValidCID } from '../../ipfs/utils'
import { isValidDataUrl } from '../../utils/base64'

export const analyzeAvatar = async (avatar, userStorage) => {
  const { userAssets } = userStorage

  if (!isString(avatar)) {
    return { shouldUnset: true }
  }

  if (isValidDataUrl(avatar)) {
    return { dataUrl: avatar, shouldUpload: true }
  }

  try {
    if (!isValidCID(avatar)) {
      throw new Error('Not a valid CID')
    }

    const { dataUrl, binary } = await userAssets.load(avatar, true)

    if (!binary) {
      return { dataUrl, shouldUpload: true }
    }
  } catch {
    return { shouldUnset: true }
  }

  return { shouldUpload: false }
}

export const updateFeedEventAvatar = async (avatar, userStorage) => {
  const { userAssets } = userStorage
  const { shouldUpload, shouldUnset, dataUrl } = await analyzeAvatar(avatar, userStorage)

  if (shouldUnset) {
    return null
  } else if (shouldUpload) {
    return userAssets.store(dataUrl)
  }

  return avatar
}
