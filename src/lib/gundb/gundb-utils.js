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
const getNodePath = node => {
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
  const user = node.back(-1).user()
  const pair = user.pair()

  let encryptedKey = await user
    .get('trust')
    .get(pair.pub)
    .get(path)
    .then()

  if (encryptedKey == null) {
    //retry fetch and increase wait
    encryptedKey = await user
      .get('trust')
      .get(pair.pub)
      .get(path)
      .then(null, isMobileNative ? 2500 : 1000)
  }
  const secureKey = await SEA.decrypt(encryptedKey, pair)

  if (!secureKey) {
    throw new Error(`Decrypting key missing`)
  }

  return secureKey
})
