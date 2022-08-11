import { memoize } from 'lodash'
import SEA from '@gooddollar/gun/sea'
import { isMobileNative } from '../utils/platform'

// eslint-disable-next-line require-await
export const getSecureKey = async node => {
  const path = getNodePath(node)

  // caching secure key per each node path
  // to avoid extra async and decrypt calls
  return fetchKey(path, node)
}

// used to flush secure keys cache for specific node
// is called from .secretAck
export const flushSecureKey = node => {
  const path = getNodePath(node)

  fetchKey.cache.delete(path)
}

/**
 * @private
 */
export const getNodePath = node => {
  let path = ''

  node.back(({ is, get }) => {
    if (is || !get) {
      return
    }

    path += get
  })

  return path
}

/**
 * @private
 */
const fetchKey = memoize(async (path, node) => {
  // memoize uses only first argument as cache key by default
  const gun = node.back(-1)
  const user = gun.user()
  const pair = user.pair()

  const ownerPub = path.split('~').pop()

  let encryptedKey = await gun
    .get('~' + ownerPub)
    .get('trust')
    .get(pair.pub)
    .get(path)
    .then()

  if (encryptedKey == null) {
    // retry fetch and increase wait
    encryptedKey = await gun
      .get('~' + ownerPub)
      .get('trust')
      .get(pair.pub)
      .get(path)
      .then(null, isMobileNative ? 2500 : 1000)
  }
  let secureKey

  // check if we are trused by owner
  if (ownerPub !== user.pair().pub) {
    // generate shared secret
    const shared = await SEA.secret(ownerPub, user.pair())
    secureKey = await SEA.decrypt(encryptedKey, shared)
  } else {
    secureKey = await SEA.decrypt(encryptedKey, pair)
  }

  if (!secureKey) {
    throw new Error(`Decrypting key missing`)
  }

  return secureKey
})
