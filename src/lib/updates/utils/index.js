import { debounce } from 'lodash'

import userStorage from '../../userStorage/UserStorage'
import * as feedUtils from './feed'

// eslint-disable-next-line require-await
export const analyzeAvatar = async avatar => feedUtils.analyzeAvatar(avatar, userStorage)

// eslint-disable-next-line require-await
export const updateFeedEventAvatar = async avatar => feedUtils.updateFeedEventAvatar(avatar, userStorage)

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
