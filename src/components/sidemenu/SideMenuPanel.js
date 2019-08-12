// @flow
import React from 'react'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import { useWrappedApi } from '../../lib/API/useWrappedApi'
import logger from '../../lib/logger/pino-logger'
import { withStyles } from '../../lib/styles'
import SimpleStore from '../../lib/undux/SimpleStore'
import { useDialog } from '../../lib/undux/utils/dialog'
import { useSidemenu } from '../../lib/undux/utils/sidemenu'
import { Icon } from '../common'
import SideMenuItem from './SideMenuItem'

type SideMenuPanelProps = {
  navigation: any,
}

const log = logger.child({ from: 'SideMenuPanel' })
const getMenuItems = ({ API, hideSidemenu, showDialog, hideDialog, navigation, store }) => ({
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
      name: 'Delete Account',
      color: 'red',
      action: () => {
        showDialog({
          title: 'Delete Account',
          message: 'Are you sure?',
          dismissText: 'DELETE',
          onCancel: () => hideDialog(),
          onDismiss: async () => {
            store.set('loadingIndicator')({ loading: true })
            const userStorage = await import('../../lib/gundb/UserStorage').then(_ => _.default)
            await userStorage
              .deleteAccount()
              .then(r => log.debug('deleted account', r))
              .catch(e => log.error('Error deleting account', e))
            store.set('loadingIndicator')({ loading: false })
            window.location = '/'
          },
        })

        hideSidemenu()
      },
    },
  ],
})

const SideMenuPanel = ({ navigation, styles, theme }: SideMenuPanelProps) => {
  const API = useWrappedApi()
  const store = SimpleStore.useStore()

  const [toggleSidemenu, hideSidemenu] = useSidemenu()
  const [showDialog, hideDialog] = useDialog()
  const { topItems, bottomItems } = getMenuItems({ API, hideSidemenu, showDialog, hideDialog, navigation, store })
  return (
    <ScrollView contentContainerStyle={styles.scrollableContainer}>
      <TouchableOpacity style={styles.closeIconRow} onPress={toggleSidemenu}>
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
