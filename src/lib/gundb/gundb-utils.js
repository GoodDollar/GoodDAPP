import SEA from '@gooddollar/gun/sea'

const secureKeys = new WeakMap()

// eslint-disable-next-line require-await
export const getSecureKey = async node => {
  // caching secure key per each node
  // to avoid extra async and decrypt calls
  if (!secureKeys.has(node)) {
    secureKeys.set(node, fetchKey(node))
  }

  return secureKeys.get(node)
}

// used to flush secure keys cache for specific node
// is called from .secretAck
export const flushSecureKey = node => secureKeys.delete(node)

/**
 * @private
 */
const fetchKey = async node => {
  let path = ''
  const user = node.back(-1).user()
  const pair = user.pair()

  node.back(({ is, get }) => {
    if (is || !get) {
      return
    }

    path += get
  })

  const encryptedKey = await user
    .get('trust')
    .get(pair.pub)
    .get(path)
    .then()

  const secureKey = await SEA.decrypt(encryptedKey, pair)

  if (!secureKey) {
    throw new Error(`Decrypting key missing`)
  }

  return secureKey
}
