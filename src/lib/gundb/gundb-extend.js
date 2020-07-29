import { assign, identity, isFunction } from 'lodash'
import { Observable, throwError } from 'rxjs'
import { map, takeLast } from 'rxjs/operators'

import Gun from '@gooddollar/gun'
import SEA from '@gooddollar/gun/sea'
import '@gooddollar/gun/lib/load'

import { isMobileNative } from '../utils/platform'
import { delay } from '../utils/async'

//gun hack to wait for data
const GUN_ONCE_DELAY = isMobileNative ? 1500 : 200
const GUN_ONTHEN_DELAY = 2000

/**
 * extend gundb SEA with decrypt to match ".secret"
 * @module
 */
const gunExtend = (() => {
  const { chain, User } = Gun

  assign(chain, {
    /**
     * fix gun issue https://github.com/amark/gun/issues/855
     */
    // eslint-disable-next-line require-await
    async then(callback, wait = GUN_ONCE_DELAY) {
      const readPromise = new Promise(resolve => this.once(resolve, { wait }))

      if (!isFunction(callback)) {
        return readPromise
      }

      return readPromise.then(callback)
    },

    /**
     * it returns a promise with the first result from a peer
     * @param {any} data Data to put onto Gun's node
     * @param {function} callback Function to be executed once write operation done
     * @param {number?} wait Optional. Interval (in ms) to await if first ack failed.
     * If at least one on further acks would be successfull, promise would resolves
     *
     * TODO: set some default value for wait (e.g. 50) if we have more that one GUN peers configiured in the env
     * @returns {Promise<ack>}
     */
    // eslint-disable-next-line require-await
    async putAck(data, callback, wait = null) {
      const writeObservable = Observable.create(subscriber => {
        let timeout
        let completed = false

        // completes observable and sets completed flag
        const complete = () => {
          completed = true
          subscriber.complete()
        }

        // if optional wait param set - setting timeout for listening ack callbacks
        if (wait) {
          timeout = setTimeout(complete, wait)
        }

        // performing put
        this.put(data, ack => {
          // on each callback:
          //  1. cheking are we completed. if yes - don't do anything
          if (completed) {
            return
          }

          // 2. emit ack to stream
          subscriber.next(ack)

          // 3.1 if wait isn't set - complete immediately
          // 3.2 if wait was set - complete once we received non-error
          if (!wait || !ack.err) {
            // 3.3. if wait was set - revoke timeout once we received non-error
            if (timeout) {
              clearTimeout(timeout)
            }

            complete()
          }
        })
      }).pipe(
        takeLast(1), // take latest value emited
        map(ack => (ack.err ? throwError(ack) : ack)), // throw if it's error
        // (we don't trow in the source observable because error completes observable)
      )

      // convert piped observable to the promise, attach callback via .then()
      return writeObservable.toPromise().then(callback || identity)
    },

    onThen(cb = undefined, opts = {}) {
      opts = Object.assign({ wait: GUN_ONTHEN_DELAY, default: undefined }, opts)
      let gun = this
      const onPromise = new Promise((res, rej) => {
        gun.on((v, k, g, ev) => {
          ev.off()

          //timeout if value is undefined
          if (v !== undefined) {
            res(v)
          }
        })
      })
      let oncePromise = new Promise(function(res, rej) {
        gun.once(
          v => {
            //timeout if value is undefined
            if (v !== undefined) {
              res(v)
            }
          },
          { wait: opts.wait },
        )
      })
      const res = Promise.race([onPromise, oncePromise, delay(opts.wait + 1000, opts.default)]).catch(_ => undefined)
      return cb ? res.then(cb) : res
    },
  })

  assign(User.prototype, {
    /**
     * saves encrypted and returns a promise with the first result from a peer
     * @returns {Promise<ack>}
     */
    secretAck(data, cb) {
      var gun = this,
        callback =
          cb ||
          function(ctx) {
            return ctx
          }
      let promise = new Promise((res, rej) => gun.secret(data, ack => (ack.err ? rej(ack) : res(ack))))
      return promise.then(callback)
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
          .then(cb)
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
})()

export default gunExtend
