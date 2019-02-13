import Gun from 'gun'
import SEA from 'gun/sea'
/**
 * extend gundb SEA with decrypt to match ".secret"
 */
export default (() => {
  Gun.User.prototype.decrypt = function(cb) {
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
      if (!sec) {
        return gun.then(cb)
      }
      return gun
        .then(async data => {
          let decrypted = await SEA.decrypt(data, sec)
          return decrypted
        })
        .then(cb)
    })()
  }
})()
