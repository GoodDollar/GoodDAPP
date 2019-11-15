// @flow
import React from 'react'
import { AsyncStorage, ScrollView, TouchableOpacity, View } from 'react-native'
import { useWrappedApi } from '../../lib/API/useWrappedApi'
import logger from '../../lib/logger/pino-logger'
import { withStyles } from '../../lib/styles'
import SimpleStore from '../../lib/undux/SimpleStore'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import { useSidemenu } from '../../lib/undux/utils/sidemenu'
import { Icon } from '../common'
import IconWrapper from '../common/modal/IconWrapper'
import { CLICK_DELETE_WALLET, fireEvent, LOGOUT } from '../../lib/analytics/analytics'
import isWebApp from '../../lib/utils/isWebApp'
import LoadingIcon from '../common/modal/LoadingIcon'
import SideMenuItem from './SideMenuItem'

type SideMenuPanelProps = {
  navigation: any,
}

export const deleteAccountDialog = ({ API, showDialog, store, theme }) => {
  showDialog('', '', {
    title: 'ARE YOU SURE?',
    message: 'If you delete your wallet',
    boldMessage: 'all your G$ will be lost forever!',
    image: <TrashIcon />,
    buttons: [
      { text: 'Cancel', onPress: dismiss => dismiss(), mode: 'text', color: theme.colors.lighterGray },
      {
        text: 'Delete',
        color: theme.colors.red,
        onPress: async () => {
          showDialog('', '', {
            title: 'ARE YOU SURE?',
            message: 'If you delete your wallet',
            boldMessage: 'all your G$ will be lost forever!',
            image: <LoadingIcon />,
            showButtons: false,
          })
          const userStorage = await import('../../lib/gundb/UserStorage').then(_ => _.default)
          let token = await userStorage.getProfileFieldValue('w3Token')

          if (!token) {
            token = await userStorage.getProfileFieldValue('loginToken')
          }

          const isDeleted = await userStorage.deleteAccount()
          log.debug('deleted account', isDeleted)

          if (isDeleted) {
            await Promise.all([AsyncStorage.clear(), API.deleteWalletFromW3Site(token)]).catch(e =>
              log.error('Error deleting account', e.message, e)
            )
            window.location = '/'
          } else {
            showDialog('Error deleting account')
          }
        },
      },
    ],
  })
}
const TrashIcon = withStyles()(({ theme }) => <IconWrapper iconName="trash" color={theme.colors.error} size={50} />)

const log = logger.child({ from: 'SideMenuPanel' })
const getMenuItems = ({ API, hideSidemenu, showDialog, navigation, store, theme }) => {
  const result = {
    topItems: [
      {
        icon: 'profile',
        name: 'My profile',
        action: () => {
          navigation.navigate({
            routeName: 'Profile',
            type: 'Navigation/NAVIGATE',
          })
          hideSidemenu()
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
          hideSidemenu()
        },
      },
      {
        icon: 'privacy',
        name: 'Profile Privacy',
        action: () => {
          navigation.navigate({
            routeName: 'ProfilePrivacy',
            type: 'Navigation/NAVIGATE',
            params: {
              backPage: 'Dashboard',
            },
          })
          hideSidemenu()
        },
      },
      {
        icon: 'faq',
        name: 'FAQ',
        action: () => {
          navigation.navigate('FAQ')
          hideSidemenu()
        },
      },
      {
        icon: 'feedback',
        name: 'Support / Feedback',
        action: () => {
          navigation.navigate('Support')
          hideSidemenu()
        },
      },
      {
        icon: 'terms-of-use',
        name: 'Terms of Use',
        action: () => {
          navigation.navigate('TOU')
          hideSidemenu()
        },
      },
      {
        icon: 'privacy-policy',
        name: 'Privacy Policy',
        action: () => {
          navigation.navigate('PP')
          hideSidemenu()
        },
      },
      {
        icon: 'gooddollar',
        name: 'About',
        action: () => {
          navigation.navigate({
            routeName: 'About',
            type: 'Navigation/NAVIGATE',
            params: {
              backPage: 'Dashboard',
            },
          })
          hideSidemenu()
        },
      },
    ],
    bottomItems: [
      {
        icon: 'trash',
        name: 'Delete wallet',
        color: 'red',
        action: () => {
          fireEvent(CLICK_DELETE_WALLET)
          deleteAccountDialog({ API, showDialog, store, theme })
          hideSidemenu()
        },
      },
    ],
  }

  if (isWebApp === false) {
    result.topItems.push({
      icon: 'logout',
      name: 'Logout',
      action: () => {
        fireEvent(LOGOUT)
        AsyncStorage.clear()
        window.location = '/'
        hideSidemenu()
      },
    })
  }

  return result
}

const SideMenuPanel = ({ navigation, styles, theme }: SideMenuPanelProps) => {
  const API = useWrappedApi()
  const store = SimpleStore.useStore()

  const [toggleSidemenu, hideSidemenu] = useSidemenu()
  const [showDialog] = useErrorDialog()
  const { topItems, bottomItems } = getMenuItems({
    API,
    hideSidemenu,
    showDialog,
    navigation,
    store,
    theme,
  })
  return (
    <ScrollView contentContainerStyle={styles.scrollableContainer}>
      <TouchableOpacity style={styles.closeIconRow} onPress={toggleSidemenu} testId="burger_button">
        <Icon name="close" size={20} color={theme.colors.lighterGray} />
      </TouchableOpacity>
      <View style={styles.listContainer}>
        {topItems.map(item => (
          <SideMenuItem key={item.name} {...item} />
        ))}
        <View style={styles.alignBottom}>
          {bottomItems.map(item => (
            <SideMenuItem key={item.name} {...item} />
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

const sideMenuPanelStyles = ({ theme }) => ({
  scrollableContainer: {
    flexGrow: 1,
  },
  closeIconRow: {
    flex: -1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: theme.sizes.defaultDouble,
    paddingBottom: theme.sizes.defaultQuadruple,
    marginHorizontal: theme.sizes.defaultDouble,
    cursor: 'pointer',
    minHeight: 20,
  },
  listContainer: {
    flexGrow: 1,
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGray,
    borderTopStyle: 'solid',
    marginHorizontal: theme.sizes.defaultDouble,
  },
  alignBottom: {
    marginTop: 'auto',
  },
})

export default withStyles(sideMenuPanelStyles)(SideMenuPanel)
