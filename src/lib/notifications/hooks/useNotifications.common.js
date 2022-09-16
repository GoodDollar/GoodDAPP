import { useCallback, useEffect, useMemo, useState } from 'react'
import usePermissions from '../../../components/permissions/hooks/usePermissions'
import { Permissions } from '../../../components/permissions/types'
import { NotificationsAPI } from '../api/NotificationsApi'
import { useUserStorage } from '../../../lib/wallet/GoodWalletProvider'

const getStoreProperty = (userStorage, property) => {
  if (!userStorage) {
    return null
  }

  return userStorage.userProperties.getLocal(property)
}

export const getCategory = notification => {
  const { payload } = notification || {}
  const { category } = payload || {}

  return category
}

export const useStoreProperty = property => {
  const userStorage = useUserStorage()

  const [propertyValue, setPropertyValue] = useState(() => getStoreProperty(userStorage, property))

  const updatePropertyValue = useCallback(
    newValue => {
      setPropertyValue(newValue)
      userStorage.userProperties.setLocal(property, newValue)
    },
    [setPropertyValue, userStorage, property],
  )

  useEffect(() => {
    setPropertyValue(getStoreProperty(userStorage, property))
  }, [property, userStorage, setPropertyValue])

  return [propertyValue, updatePropertyValue]
}

export const useNotificationsSupport = () => {
  const [supportedState, setSupportedState] = useState('')
  const supported = useMemo(() => supportedState === true, [supportedState])
  const unsupported = useMemo(() => supportedState === false, [supportedState])

  useEffect(() => {
    NotificationsAPI.isSupported()
      .catch(() => false)
      .then(setSupportedState)
  }, [setSupportedState])

  return [supported, unsupported]
}

export const useNotificationsStateSwitch = (storeProp, updateState, options = {}) => {
  const { onAllowed, requestOnMounted = false, ...otherOptions } = options
  const enabled = useMemo(() => !!storeProp, [storeProp])
  const _onAllowed = useCallback(() => {
    updateState(true)
    onAllowed?.()
  }, [updateState])

  const [allowed, requestPermission] = usePermissions(Permissions.Notifications, {
    ...otherOptions,
    onAllowed: _onAllowed,
    requestOnMounted,
  })

  const toggleEnabled = useCallback(
    (newState, option = {}) => {
      if (newState === enabled) {
        return
      }

      if (newState && !allowed) {
        requestPermission(option)
        return
      }

      updateState(newState)
    },
    [allowed, enabled, requestPermission, updateState],
  )

  return [enabled, toggleEnabled]
}
