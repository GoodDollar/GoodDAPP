// @flow
import { useCallback, useMemo } from 'react'
import { isMobileSafari } from 'mobile-device-detect'

// hooks
import SimpleStore from '../undux/SimpleStore'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import { hideSidemenu, showSidemenu, toggleSidemenu } from '../undux/utils/sidemenu'

// utils
import { useWrappedApi } from '../API/useWrappedApi'
import { isMobileOnly, isWeb } from '../utils/platform'
import { openLink } from '../utils/linking'
import Config from '../../config/config'
import AsyncStorage from '../../lib/utils/asyncStorage'

// constants
import { CLICK_DELETE_WALLET, fireEvent, LOGOUT } from '../../lib/analytics/analytics'
import { REGISTRATION_METHOD_SELF_CUSTODY } from '../constants/login'
import useDeleteAccountDialog from './useDeleteAccountDialog'

const { dashboardUrl } = Config

export default (props = {}) => {
  const { navigation, theme } = props
  const API = useWrappedApi()
  const store = SimpleStore.useStore()
  const [showErrorDialog] = useErrorDialog()
  const regMethod = store.get('regMethod')
  const isSelfCustody = regMethod === REGISTRATION_METHOD_SELF_CUSTODY

  const showDeleteAccountDialog = useDeleteAccountDialog({ API, showErrorDialog, store, theme })

  const slideToggle = useCallback(() => toggleSidemenu(store), [store])
  const slideIn = useCallback(() => showSidemenu(store), [store])
  const slideOut = useCallback(() => hideSidemenu(store), [store])

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
    [slideOut, showDeleteAccountDialog],
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

      // {
      //   icon: 'link',
      //   name: 'Magic Link',
      //   size: 18,
      //   hidden: isSelfCustody === false,
      //   action: () => {
      //     navigation.navigate({
      //       routeName: 'MagicLinkInfo',
      //       type: 'Navigation/NAVIGATE',
      //     })
      //     slideOut()
      //   },
      // },
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
        icon: 'lock',
        name: 'Backup Wallet',
        hidden: isSelfCustody === false,
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
        centered: true,
        name: 'Statistics',
        action: () => {
          slideOut()

          if (isWeb && !isMobileOnly) {
            openLink(dashboardUrl)
            return
          }

          navigation.navigate({
            routeName: 'Statistics',
            type: 'Navigation/NAVIGATE',
          })
        },
      },
      {
        icon: 'faq',
        size: 18,
        name: 'Help & Feedback',
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
