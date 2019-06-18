// @flow
import React from 'react'
import SideMenuItem from './SideMenuItem'
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { Icon, normalize } from 'react-native-elements'
import { useSidemenu } from '../../lib/undux/utils/sidemenu'
import { useWrappedApi } from '../../lib/API/useWrappedApi'
import { useDialog } from '../../lib/undux/utils/dialog'
import userStorage from '../../lib/gundb/UserStorage'
import logger from '../../lib/logger/pino-logger'
import GDStore from '../../lib/undux/GDStore'
type SideMenuPanelProps = {
  navigation: any
}

const log = logger.child({ from: 'SideMenuPanel' })
const getMenuItems = ({ API, hideSidemenu, showDialog, hideDialog, navigation, store }) => [
  {
    icon: 'person',
    name: 'Your profile',
    action: () => {
      navigation.navigate({
        routeName: 'Profile',
        type: 'Navigation/NAVIGATE'
      })
      hideSidemenu()
    }
  },
  {
    icon: 'lock',
    name: 'Backup Your Wallet',
    action: async () => {
      navigation.navigate({
        routeName: 'BackupWallet',
        type: 'Navigation/NAVIGATE'
      })
      hideSidemenu()
    }
  },
  {
    icon: 'person-pin',
    name: 'Privacy Policy',
    action: async () => {
      navigation.navigate('PP')
      hideSidemenu()
    }
  },
  {
    icon: 'announcement',
    name: 'Terms of Use',
    action: async () => {
      navigation.navigate('TOU')
      hideSidemenu()
    }
  },
  // {
  //   icon: 'notifications',
  //   name: 'Notification Settings'
  // },
  // {
  //   icon: 'person',
  //   name: 'Send Feedback'
  // },
  {
    icon: 'comment',
    name: 'Support',
    action: async () => {
      navigation.navigate('Support')
      hideSidemenu()
    }
  },
  // {
  //   icon: 'question-answer',
  //   name: 'About'
  // },
  {
    icon: 'delete',
    name: 'Delete Account',
    action: () => {
      showDialog({
        title: 'Delete Account',
        message: 'Are you sure?',
        dismissText: 'DELETE',
        onCancel: () => hideDialog(),
        onDismiss: async () => {
          store.set('loadingIndicator')({ loading: true })
          hideSidemenu()
          await userStorage
            .deleteAccount()
            .then(r => log.debug('deleted account', r))
            .catch(e => log.error('Error deleting account', e))
          store.set('loadingIndicator')({ loading: false })
          window.location = '/'
        }
      })
    }
  }
]

const SideMenuPanel = ({ navigation }: SideMenuPanelProps) => {
  const API = useWrappedApi()
  const store = GDStore.useStore()
  const [toggleSidemenu, hideSidemenu] = useSidemenu()
  const [showDialog, hideDialog] = useDialog()
  const MENU_ITEMS = getMenuItems({ API, hideSidemenu, showDialog, hideDialog, navigation, store })
  return (
    <ScrollView>
      <TouchableOpacity style={styles.closeIconRow} onPress={toggleSidemenu}>
        <Icon name="close" />
      </TouchableOpacity>
      {MENU_ITEMS.map(item => (
        <SideMenuItem key={item.name} {...item} />
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  closeIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginVertical: normalize(20),
    marginLeft: 'auto',
    marginRight: normalize(20),
    cursor: 'pointer'
  }
})

export default SideMenuPanel
