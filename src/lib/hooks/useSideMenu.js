// @flow
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AsyncStorage } from 'react-native'
import { isMobileSafari } from 'mobile-device-detect'

import SimpleStore from '../undux/SimpleStore'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import { hideSidemenu, showSidemenu, toggleSidemenu } from '../undux/utils/sidemenu'

import { useWrappedApi } from '../API/useWrappedApi'

import { CLICK_DELETE_WALLET, fireEvent, LOGOUT } from '../../lib/analytics/analytics'
import { GD_USER_MASTERSEED, GD_USER_MNEMONIC } from '../../lib/constants/localStorage'
import useDeleteAccountDialog from './useDeleteAccountDialog'

export default (props = {}) => {
  const { navigation, theme } = props
  const API = useWrappedApi()
  const store = SimpleStore.useStore()
  const [showErrorDialog] = useErrorDialog()
  const isLoggedIn = store.get('isLoggedIn')
  const showDeleteAccountDialog = useDeleteAccountDialog({ API, showErrorDialog, store, theme })

  const [isSelfCustody, setIsSelfCustody] = useState(false)
  const slideToggle = useCallback(() => toggleSidemenu(store), [store])
  const slideIn = useCallback(() => showSidemenu(store), [store])
  const slideOut = useCallback(() => hideSidemenu(store), [store])

  const getIsSelfCustody = async () => {
    if (isLoggedIn) {
      const hasSeed = await AsyncStorage.getItem(GD_USER_MASTERSEED)
      const hasMnemonic = await AsyncStorage.getItem(GD_USER_MNEMONIC)
      setIsSelfCustody(hasSeed == null && hasMnemonic)
    }
  }

  useEffect(() => {
    getIsSelfCustody()
  }, [isLoggedIn])

  const bottomItems = useMemo(
    () => [
      {
        icon: 'trash',
        name: 'Delete Account',
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
        size: 18,
        name: 'Add App To Home',
        hidden: !installPrompt && !isMobileSafari,
        action: () => {
          store.set('addWebApp')({ showAddWebAppDialog: true })
          slideOut()
        },
      },
      {
        icon: 'link',
        name: 'Magic Link',
        size: 18,
        hidden: isSelfCustody === false,
        action: () => {
          navigation.navigate({
            routeName: 'MagicLinkInfo',
            type: 'Navigation/NAVIGATE',
          })
          slideOut()
        },
      },
      {
        icon: 'export-wallet',
        size: 18,
        name: 'Export Wallet',
        action: () => {
          navigation.navigate({
            routeName: 'ExportWallet',
            type: 'Navigation/NAVIGATE',
          })
          slideOut()
        },
      },
      {
        icon: 'statistics',
        centered: true,
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
        size: 18,
        name: 'Support & Feedback',
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
      {
        icon: 'logout',
        name: 'Logout',
        action: () => {
          fireEvent(LOGOUT)
          AsyncStorage.clear()
          window.location = '/'
          slideOut()
        },
      },
    ]

    return items
  }, [isSelfCustody, slideOut, navigation, store])

  return {
    slideIn,
    slideOut,
    slideToggle,

    topItems,
    bottomItems,
  }
}
