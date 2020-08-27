import { assign, identity, noop, once } from 'lodash'

import Gun from '@gooddollar/gun'
import SEA from '@gooddollar/gun/sea'
import '@gooddollar/gun/lib/load'

import { delay, retry } from '../utils/async'

/**
 * extend gundb SEA with decrypt to match ".secret"
 * @module
 */
const { chain, User } = Gun

// eslint-disable-next-line require-await
const promisify = async callback =>
  new Promise((resolve, reject) => {
    const onAck = once(ack => (ack.err ? reject : resolve)(ack))

    callback(onAck)
  })

assign(chain, {
  /**
   * fix gun issue https://github.com/amark/gun/issues/855
   */
  // eslint-disable-next-line require-await
  async then(callback = null, wait = 200) {
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
    const writePromise = retry(() => promisify(onAck => this.put(data, onAck)), 1)

    return writePromise.then(callback || identity)
  },

  onThen(callback = null, options = null) {
    const { wait = 2000, default: defaultValue } = options || {}

    const onPromise = new Promise(resolve =>
      this.on((v, k, g, ev) => {
        ev.off()

        // timeout if value is undefined
        if (v !== undefined) {
          resolve(v)
        }
      }),
    )

    const oncePromise = new Promise(resolve =>
      this.once(
        v => {
          // timeout if value is undefined
          if (v !== undefined) {
            resolve(v)
          }
        },
        { wait },
      ),
    )

    return Promise.race([onPromise, oncePromise, delay(wait + 1000, defaultValue)])
      .then(callback || identity)
      .catch(noop)
  },
})

assign(User.prototype, {
  /**
   * saves encrypted and returns a promise with the first result from a peer
   * @returns {Promise<ack>}
   */
  // eslint-disable-next-line require-await
  secretAck(data, callback = null) {
    const encryptPromise = retry(() => promisify(onAck => this.secret(data, onAck)), 1)

    return encryptPromise.then(callback || identity)
  },

  /**
   * returns the decrypted value
   * @returns {Promise<any>}
   */
  decrypt(cb) {
    var gun = this,
      user = gun.back(-1).user(),
      pair = user.pair(),
      path = ''
    gun.back(function(at) {
      if (at.is) {
        return
      }
      path += at.get || ''
    })
    return (async () => {
      let sec = await user
        .get('trust')
        .get(pair.pub)
        .get(path)
        .then()
      sec = await SEA.decrypt(sec, pair)
      return gun
        .then(async data => {
          if (data == null) {
            return data
          }
          if (!sec) {
            return Promise.reject('decrypting key missing for ' + path)
          }
          let decrypted = await SEA.decrypt(data, sec)
          return decrypted
        })
        .then(cb || identity)
    })()
  },

  /**
   * restore a user from saved credentials
   * this bypasses the user/password which is slow because of pbkdf2 iterations
   * this is based on Gun.User.prototype.auth act.g in original sea.js
   */
  restore(credentials) {
    var gun = this,
      cat = gun._,
      root = gun.back(-1)
    const pair = credentials.sea
    var user = root._.user,
      at = user._
    var upt = at.opt
    at = user._ = root.get('~' + pair.pub)._
    at.opt = upt

    // add our credentials in-memory only to our root user instance
    user.is = credentials.is
    at.sea = pair
    cat.ing = false
  },
})
