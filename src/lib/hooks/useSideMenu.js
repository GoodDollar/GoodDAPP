// @flow
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { t } from '@lingui/macro'
import AsyncStorage from '../utils/asyncStorage'
import restart from '../utils/restart'

// hooks
import SimpleStore from '../undux/SimpleStore'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import logger from '../../lib/logger/js-logger'

// utils
import { isMobileOnly, isMobileSafari, isWeb } from '../utils/platform'
import { openLink } from '../utils/linking'
import Config from '../../config/config'

// constants
import { CLICK_DELETE_WALLET, fireEvent, LOGOUT } from '../../lib/analytics/analytics'
import { GlobalTogglesContext } from '../../lib/contexts/togglesContext'
import { REGISTRATION_METHOD_SELF_CUSTODY } from '../constants/login'
import useDeleteAccountDialog from './useDeleteAccountDialog'
import useUserContext from './useUserContext'

const log = logger.child({ from: 'useSideMenu' })

const { dashboardUrl } = Config

export default (props = {}) => {
  const { navigation } = props
  const store = SimpleStore.useStore()
  const [showErrorDialog] = useErrorDialog()
  const { isLoggedIn } = useUserContext()
  const showDeleteAccountDialog = useDeleteAccountDialog(showErrorDialog)

  const [isSelfCustody, setIsSelfCustody] = useState(false)
  const { isMenuOn, setMenu } = useContext(GlobalTogglesContext)
  const slideToggle = useCallback(() => setMenu(!isMenuOn), [isMenuOn, setMenu])
  const slideIn = useCallback(() => !isMenuOn && setMenu(true), [isMenuOn, setMenu])
  const slideOut = useCallback(() => isMenuOn && setMenu(false), [isMenuOn, setMenu])

  const getIsSelfCustody = () => {
    if (isLoggedIn) {
      const regMethod = store.get('regMethod')

      setIsSelfCustody(regMethod === REGISTRATION_METHOD_SELF_CUSTODY)
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
    [slideOut, showDeleteAccountDialog],
  )

  const topItems = useMemo(() => {
    const installPrompt = store.get('installPrompt')

    let items = [
      {
        icon: 'profile',
        name: t`My profile`,
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
        name: t`Add App To Home`,
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
        name: t`Export Wallet`,
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
        name: t`Backup Wallet`,
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
        name: t`Statistics`,
        size: 18,
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
        name: t`Help & Feedback`,
        action: () => {
          navigation.navigate('Support')
          slideOut()
        },
      },
      {
        icon: 'terms-of-use',
        name: t`Privacy Policy & Terms`,
        action: () => {
          navigation.navigate('TOU')
          slideOut()
        },
      },
      {
        icon: 'logout',
        name: t`Logout`,
        action: async () => {
          fireEvent(LOGOUT)
          try {
            await AsyncStorage.clear()
          } catch (e) {
            if (e) {
              log.error('AsyncStorage Error', e.message, e)
            }
          }
          slideOut()
          restart('/')
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
