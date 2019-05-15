// @flow
import React from 'react'
import SideMenuItem from './SideMenuItem'
import { View, StyleSheet } from 'react-native'
import { Icon, normalize } from 'react-native-elements'
import { useSidemenu } from '../../lib/undux/utils/sidemenu'
import { useWrappedApi } from '../../lib/API/useWrappedApi'

type SideMenuPanelProps = {
  navigation: any,
  getItems: Function
}

const getMenuItems = ({ API, sidemenuActions, navigation }) => {
  const { hideSidemenu } = sidemenuActions
  return [
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
      icon: 'person',
      name: 'Profile Privacy'
    },
    {
      icon: 'notifications',
      name: 'Notification Settings'
    },
    {
      icon: 'person',
      name: 'Send Feedback'
    },
    {
      icon: 'comment',
      name: 'FAQ'
    },
    {
      icon: 'question-answer',
      name: 'About'
    }
  ]
}

const SideMenuPanel = ({ navigation }: SideMenuPanelProps) => {
  const API = useWrappedApi()
  const sidemenuActions = useSidemenu()
  const { toggleSidemenu } = sidemenuActions

  const MENU_ITEMS = getMenuItems({ API, sidemenuActions, navigation })
  return (
    <View>
      <View style={styles.closeIconRow} onClick={toggleSidemenu}>
        <Icon name="close" />
      </View>
      {MENU_ITEMS.map(item => (
        <SideMenuItem key={item.name} {...item} />
      ))}
    </View>
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
