import { isString } from 'lodash'

import IPFS from '../ipfs/IpfsStorage'
import { isValidCID } from '../ipfs/utils'
import { isValidDataUrl } from '../utils/base64'

export const analyzeAvatar = async avatar => {
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

    const { dataUrl, binary } = await IPFS.load(avatar, {
      skipCache: true,
      withFormat: true,
    })

    if (!binary) {
      return { dataUrl, shouldUpload: true }
    }
  } catch {
    return { shouldUnset: true }
  }

  return { shouldUpload: false }
}

export const updateFeedEventAvatar = async avatar => {
  const { shouldUpload, shouldUnset, dataUrl } = await analyzeAvatar(avatar)

  if (shouldUnset) {
    return null
  } else if (shouldUpload) {
    return IPFS.store(dataUrl)
  }

  return avatar
}
