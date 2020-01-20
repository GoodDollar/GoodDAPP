import Gun from 'gun/gun'
import SEA from 'gun/sea'
import 'gun/lib/load'

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
        gun.once(res, { wait: 200 })
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
})()

export default gunExtend
