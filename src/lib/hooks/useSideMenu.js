// @flow
import { useCallback, useMemo } from 'react'
import { AsyncStorage } from 'react-native'
import { isMobileSafari } from 'mobile-device-detect'

import SimpleStore from '../undux/SimpleStore'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import { hideSidemenu, showSidemenu, toggleSidemenu } from '../undux/utils/sidemenu'

import { useWrappedApi } from '../API/useWrappedApi'

import { CLICK_DELETE_WALLET, fireEvent, LOGOUT } from '../../lib/analytics/analytics'
import isWebApp from '../../lib/utils/isWebApp'
import Config from '../../config/config'
import useDeleteAccountDialog from './useDeleteAccountDialog'

export default (props = {}) => {
  const { navigation, theme } = props
  const API = useWrappedApi()
  const store = SimpleStore.useStore()
  const [showDialog] = useErrorDialog()
  const showDeleteAccountDialog = useDeleteAccountDialog({ API, showDialog, store, theme })

  const slideToggle = useCallback(() => toggleSidemenu(store), [store])
  const slideIn = useCallback(() => showSidemenu(store), [store])
  const slideOut = useCallback(() => hideSidemenu(store), [store])

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
        name: 'FAQ',
        action: () => {
          navigation.navigate('FAQ')
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
    if (Config.torusEnabled) {
      items = items.filter(i => ['Magic Link', 'Backup Wallet'].includes(i.name) === false)
    }
    return items
  }, [slideOut, navigation, store])

  return {
    slideIn,
    slideOut,
    slideToggle,

    topItems,
    bottomItems,
  }
}
