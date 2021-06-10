import { assign, identity, isFunction, noop, over } from 'lodash'

import Gun from '@gooddollar/gun'
import SEA from '@gooddollar/gun/sea'
import '@gooddollar/gun/lib/load'

import { delay, promisifyGun, retry } from '../utils/async'
import { isMobileNative } from '../utils/platform'
import { flushSecureKey, getNodePath, getSecureKey } from './gundb-utils'

/**
 * extend gundb SEA with decrypt to match ".secret"
 * @module
 */
const { chain, User } = Gun

assign(chain, {
  /**
   * fix gun issue https://github.com/amark/gun/issues/855
   */
  // eslint-disable-next-line require-await
  async then(callback = null, wait = isMobileNative ? 1000 : 200) {
    // gun hack to wait for data
    const readPromise = new Promise(resolve => this.once(resolve, { wait }))

    return readPromise.then(callback || identity)
  },

  /**
   * it returns a promise with the first result from a peer
   * @param {any} data Data to put onto Gun's node
   * @param {function} callback Function to be executed once write operation done
   * @returns {Promise<ack>}
   */
  // eslint-disable-next-line require-await
  async putAck(data, callback = null) {
    const writePromise = retry(() => promisifyGun(onAck => this.put(data, onAck)), 1)

    return writePromise.then(callback || identity)
  },

  onThen(callback = null, options = null) {
    const { wait = 2000, default: defaultValue } = options || {}

    const onPromise = new Promise(resolve =>
      this.on((value, _, __, event) => {
        event.off()

        // timeout if value is undefined
        if (value !== undefined) {
          resolve(value)
        }
      }),
    )

    const oncePromise = new Promise(resolve =>
      this.once(
        value => {
          // timeout if value is undefined
          if (value !== undefined) {
            resolve(value)
          }
        },
        { wait },
      ),
    )

    const defaultPromise = delay(wait + 1000, defaultValue)

    return Promise.race([onPromise, oncePromise, defaultPromise])
      .then(callback || identity)
      .catch(noop)
  },

  /**
   * Returns the decrypted value
   * @returns {Promise<any>}
   */
  async decrypt(callback = null) {
    let decryptedData = null

    // firstly we'll got the node data
    const encryptedData = await this.then()

    // if it's empty - no need to get secure key. just resolve with null
    if (encryptedData != null) {
      const secureKey = await getSecureKey(this)

      decryptedData = await SEA.decrypt(encryptedData, secureKey)
    }

    return (callback || identity)(decryptedData)
  },

  /**
   * Returns the decrypted value
   * @returns {Promise<any>}
   */
  // eslint-disable-next-line require-await
  async onDecrypt(callback = null) {
    let _resolve
    let decryptedData = null
    const resolve = value => over([callback, _resolve].filter(isFunction))(value)
    const promise = new Promise(resolve => (_resolve = resolve))

    // firstly we'll got the node data
    this.on(async (encryptedData, nodeID, message, event) => {
      event.off()

      // if it's empty - no need to get secure key. just resolve with null
      if (encryptedData != null) {
        const secureKey = await getSecureKey(this)

        decryptedData = await SEA.decrypt(encryptedData, secureKey)
      }

      resolve(decryptedData)
    })

    return promise
  },
})

assign(User.prototype, {
  async trust(publicKey, cb) {
    let gun = this
    let user = gun.back(-1).user()
    let pair = user._.sea
    let path = getNodePath(gun)

    let enc
    let sec = await getSecureKey(this)
    if (!sec) {
      throw new Error('cant trust non existing secureKey')
    }
    var dh = await SEA.secret(publicKey, pair)
    enc = await SEA.encrypt(sec, dh)
    const res = await user
      .get('trust')
      .get(publicKey)
      .get(path)
      .putAck(enc)

    return (cb || identity)(res)
  },

  /**
   * saves encrypted and returns a promise with the first result from a peer
   * @returns {Promise<ack>}
   */
  // eslint-disable-next-line require-await
  async secretAck(data, callback = null) {
    const encryptPromise = retry(() => promisifyGun(onAck => this.secret(data, onAck)), 1)

    flushSecureKey(this)
    return encryptPromise.then(callback || identity)
  },

  /**
   * To save encrypted data to your user graph only trusted users can read.
   */

  /**
   * restore a user from saved credentials
   * this bypasses the user/password which is slow because of pbkdf2 iterations
   * this is based on Gun.User.prototype.auth act.g in original sea.js
   */
  restore(credentials) {
    const root = this.back(-1)
    const { sea, is } = credentials
    const { user } = root._
    const { opt } = user._

    this._.ing = false
    user._ = root.get('~' + sea.pub)._

    assign(user, { is })
    assign(user._, { opt, sea })
  },
})
