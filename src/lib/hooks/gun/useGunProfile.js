import { useEffect, useRef, useState } from 'react'
import { get, result } from 'lodash'
import userStorage from '../../gundb/UserStorage'
import isEmail from '../../validators/isEmail'
import isMobilePhone from '../../validators/isMobilePhone'
import logger from '../../logger/pino-logger'

const log = logger.child({ from: 'useGunProfile' })

const useGunProfile = (identifier, fields = ['fullName', 'smallAvatar']) => {
  const attr = isMobilePhone(identifier) ? 'mobile' : isEmail(identifier) ? 'email' : 'walletAddress'
  const value = userStorage.constructor.cleanHashedFieldForIndex(attr, identifier)
  const gunSubscriptions = useRef({})
  const [profile, setProfile] = useState({})

  const onProfileField = field => (data, nodeID, message, event) => {
    log.debug('got field:', { data, field })
    gunSubscriptions.current[field] = { event, value: data }
    const updated = {}
    fields.forEach(f => (updated[f] = get(gunSubscriptions, `current.${f}.value`)))
    setProfile(updated)
  }

  const unsubscribe = () => {
    fields.forEach(field => {
      log.debug('unsubscribe field:', { field })

      result('gunSubscriptions.current', `${field}.event.off`)
      delete gunSubscriptions.current[field]
    })
  }

  useEffect(() => {
    if (!identifier || !fields) {
      return
    }
    log.debug('subscribing to fields:', { identifier, fields })

    const index = userStorage.trust[`by${attr}`] || `users/by${attr}`
    fields.forEach(field => {
      userStorage.gun
        .get(index)
        .get(value)
        .get('profile')
        .get(field)
        .get('display')
        .on(onProfileField(field))
    })
    return unsubscribe
  }, [identifier, ...fields])

  return profile
}

export default useGunProfile
