import Gun from 'gun/gun'
import SEA from 'gun/sea'
import 'gun/lib/load'
import { isMobileNative } from '../utils/platform'

//gun hack to wait for data
const GUN_ONCE_DELAY = isMobileNative ? 1500 : 200

/**
 * extend gundb SEA with decrypt to match ".secret"
 * @module
 */
const gunExtend = (() => {
  /**
   * fix gun issue https://github.com/amark/gun/issues/855
   */
  Gun.chain.then = function(cb) {
    var gun = this,
      p = new Promise(function(res, rej) {
        gun.once(res, { wait: GUN_ONCE_DELAY })
      })
    return cb ? p.then(cb) : p
  }

  /**
   * it returns a promise with the first result from a peer
   * @returns {Promise<ack>}
   */
  Gun.chain.putAck = function(data, cb) {
    var gun = this,
      callback =
        cb ||
        function(ctx) {
          return ctx
        }
    let promise = new Promise((res, rej) => gun.put(data, ack => (ack.err ? rej(ack) : res(ack))))
    return promise.then(callback)
  }

  /**
   * saves encrypted and returns a promise with the first result from a peer
   * @returns {Promise<ack>}
   */
  Gun.User.prototype.secretAck = function(data, cb) {
    var gun = this,
      callback =
        cb ||
        function(ctx) {
          return ctx
        }
    let promise = new Promise((res, rej) => gun.secret(data, ack => (ack.err ? rej(ack) : res(ack))))
    return promise.then(callback)
  }

  /**
   * returns the decrypted value
   * @returns {Promise<any>}
   */
  Gun.User.prototype.decrypt = function(cb) {
    let gun = this,
      path = ''
    gun.back(function(at) {
      if (at.is) {
        return
      }
      path += at.get || ''
    })
    return gun
      .then(async data => {
        if (data == null) {
          return
        }
        const user = gun.back(-1).user()
        const pair = user.pair()
        let sec = await user
          .get('trust')
          .get(pair.pub)
          .get(path)
        sec = await SEA.decrypt(sec, pair)
        if (!sec) {
          return data
        }
        let decrypted = await SEA.decrypt(data, sec)
        return decrypted
      })
      .then(res => {
        cb && cb(res)
        return res
      })
  }

  /**
   * restore a user from saved credentials
   * this bypasses the user/password which is slow because of pbkdf2 iterations
   * this is based on Gun.User.prototype.auth act.g in original sea.js
   */
  Gun.User.prototype.restore = function(credentials) {
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
  }

  /**
   * restore a user from saved credentials
   * this bypasses the user/password which is slow because of pbkdf2 iterations
   * this is based on Gun.User.prototype.auth act.g in original sea.js
   */
  Gun.User.prototype.restore = function(credentials) {
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
  }
})()

export default gunExtend
