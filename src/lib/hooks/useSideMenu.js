// @flow
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AsyncStorage } from 'react-native'
import { isMobileSafari } from 'mobile-device-detect'

import SimpleStore from '../undux/SimpleStore'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import { hideSidemenu, showSidemenu, toggleSidemenu } from '../undux/utils/sidemenu'
import userStorage from '../gundb/UserStorage'

import { useWrappedApi } from '../API/useWrappedApi'

import { CLICK_DELETE_WALLET, fireEvent, LOGOUT } from '../../lib/analytics/analytics'
import { REGISTRATION_METHOD_TORUS } from '../../lib/constants/login'
import isWebApp from '../../lib/utils/isWebApp'
import useDeleteAccountDialog from './useDeleteAccountDialog'

export default (props = {}) => {
  const { navigation, theme } = props
  const API = useWrappedApi()
  const store = SimpleStore.useStore()
  const [showDialog] = useErrorDialog()
  const showDeleteAccountDialog = useDeleteAccountDialog({ API, showDialog, store, theme })

  const [regMethod, setRegMethod] = useState()
  const slideToggle = useCallback(() => toggleSidemenu(store), [store])
  const slideIn = useCallback(() => showSidemenu(store), [store])
  const slideOut = useCallback(() => hideSidemenu(store), [store])

  useEffect(() => {
    userStorage.userProperties.get('regMethod').then(setRegMethod)
  }, [])

  const bottomItems = useMemo(
    () => [
      {
        icon: 'trash',
        name: 'Delete wallet',
        color: 'red',
        action: () => {
          fireEvent(CLICK_DELETE_WALLET)
          showDeleteAccountDialog()
          slideOut()
        },
      },
    ],
    [slideOut, showDeleteAccountDialog]
  )

  const topItems = useMemo(() => {
    const installPrompt = store.get('installPrompt')
    const isRegMethodTorus = regMethod === REGISTRATION_METHOD_TORUS

    let items = [
      {
        icon: 'profile',
        name: 'My profile',
        action: () => {
          navigation.navigate({
            routeName: 'Profile',
            type: 'Navigation/NAVIGATE',
          })
          slideOut()
        },
      },
      {
        icon: 'add',
        name: 'Add App Icon',
        hidden: !installPrompt && !isMobileSafari,
        action: () => {
          store.set('addWebApp')({ showAddWebAppDialog: true })
          slideOut()
        },
      },
      {
        icon: 'link',
        name: 'Magic Link',
        hidden: isRegMethodTorus,
        action: () => {
          navigation.navigate({
            routeName: 'MagicLinkInfo',
            type: 'Navigation/NAVIGATE',
          })
          slideOut()
        },
      },
      {
        icon: 'lock',
        name: 'Backup Wallet',
        hidden: isRegMethodTorus,
        action: () => {
          navigation.navigate({
            routeName: 'BackupWallet',
            type: 'Navigation/NAVIGATE',
          })
          slideOut()
        },
      },
      {
        icon: 'statistics',
        name: 'Statistics',
        action: () => {
          navigation.navigate({
            routeName: 'Statistics',
            type: 'Navigation/NAVIGATE',
          })
          slideOut()
        },
      },
      {
        icon: 'faq',
        name: 'Support & FAQ',
        action: () => {
          navigation.navigate('Support')
          slideOut()
        },
      },
      {
        icon: 'terms-of-use',
        name: 'Privacy Policy & Terms',
        action: () => {
          navigation.navigate('TOU')
          slideOut()
        },
      },
    ]

    if (!isWebApp) {
      items.push({
        icon: 'logout',
        name: 'Logout',
        action: () => {
          fireEvent(LOGOUT)
          AsyncStorage.clear()
          window.location = '/'
          slideOut()
        },
      })
    }
    return items
  }, [regMethod, slideOut, navigation, store])

  return {
    slideIn,
    slideOut,
    slideToggle,

    topItems,
    bottomItems,
  }
}
