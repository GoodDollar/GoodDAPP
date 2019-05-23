// @flow
import React from 'react'
import SideMenuItem from './SideMenuItem'
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { Icon, normalize } from 'react-native-elements'
import { useSidemenu } from '../../lib/undux/utils/sidemenu'
import { useWrappedApi } from '../../lib/API/useWrappedApi'

type SideMenuPanelProps = {
  navigation: any
}

const getMenuItems = ({ API, hideSidemenu, navigation }) => [
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

const SideMenuPanel = ({ navigation }: SideMenuPanelProps) => {
  const API = useWrappedApi()
  const [toggleSidemenu, hideSidemenu] = useSidemenu()
  const MENU_ITEMS = getMenuItems({ API, hideSidemenu, navigation })
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
