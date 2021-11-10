import { useEffect, useRef, useState } from 'react'
import { get, result } from 'lodash'
import logger from '../logger/js-logger'
import userStorage from './UserStorage'

const log = logger.child({ from: 'useGunProfile' })

const useGunProfile = (identifier, fields = ['fullName', 'smallAvatar']) => {
  const gunSubscriptions = useRef({})
  const [profile, setProfile] = useState({})

  const getFieldListener = field => (data, nodeID, message, event) => {
    log.debug('got field:', { identifier, field, data })

    gunSubscriptions.current[field] = { event, value: data }
    const updated = {}
    fields.forEach(field => (updated[field] = get(gunSubscriptions, `current.${field}.value`)))
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
    const subscribe = async () => {
      const publicKey = await userStorage.getUserProfilePublickey(identifier)
      log.debug('subscribing to fields:', { publicKey, identifier, fields })

      if (!publicKey) {
        return
      }

      fields.forEach(field => {
        userStorage.gun
          .get(publicKey)
          .get('profile')
          .get(field)
          .get('display')
          .on(getFieldListener(field))
      })
    }

    subscribe()

    return unsubscribe
  }, [identifier, ...fields])

  return profile
}

export default useGunProfile
