import { debounce, isString } from 'lodash'

import { isValidCID } from '../ipfs/utils'
import { isValidDataUrl } from '../utils/base64'

import userStorage from '../userStorage/UserStorage'

export const analyzeAvatar = async avatar => {
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

export const updateFeedEventAvatar = async avatar => {
  const { userAssets } = userStorage
  const { shouldUpload, shouldUnset, dataUrl } = await analyzeAvatar(avatar)

  if (shouldUnset) {
    return null
  } else if (shouldUpload) {
    return userAssets.store(dataUrl)
  }

  return avatar
}

// eslint-disable-next-line require-await
export const gunPublicKeyTrust = async () => {
  const { gunuser } = userStorage
  const pubkey = gunuser.pair().pub

  return gunuser
    .get('trust')
    .get(pubkey)
    .then(null, 3000)
}

// https://github.com/GoodDollar/GoodDAPP/pull/3388#discussion_r690419144
// eslint-disable-next-line require-await
export const processGunNode = async (node, callback) =>
  new Promise((resolve, reject) => {
    let eventListener

    // debounced fn to resolve promise only if there were
    // no new data blocks during 3 sec from the last one
    const onDataChunk = debounce(() => {
      if (eventListener) {
        eventListener.off()
      }

      resolve()
    }, 3000)

    node.on(async (data, _, __, listener) => {
      if (!eventListener) {
        eventListener = listener
      }

      try {
        await callback(data)
        onDataChunk()
      } catch (exception) {
        eventListener = null

        // if got an exception - stop .on() subscription
        listener.off()

        // and reject a promise
        reject(exception)
      }
    })
  })
